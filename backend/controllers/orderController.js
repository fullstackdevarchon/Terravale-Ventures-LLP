import Order from "../models/Order.js";
import Product from "../models/Product.js";
import cron from "node-cron";
import mongoose from "mongoose";

//
// ------------------- Status Flow -------------------
//
const STATUS_FLOW = ["Order Placed", "Confirmed", "Shipped", "Delivered"];

//
// ------------------- REMOVED AUTO UPDATE -------------------
//   No cron job
//   No auto update
//   No status auto progression
//

//
// ------------------- Buyer Controllers -------------------
//
export const createOrder = async (req, res) => {
  try {
    const { products, address } = req.body;
    const buyer = req.user?._id || req.user?.id;

    if (!buyer) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in again.",
      });
    }
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products in order",
      });
    }

    let subtotal = 0;
    const processedProducts = [];

    for (let item of products) {
      let productId = item?.product ?? item?.productId ?? item?._id ?? item?.id;
      if (productId && typeof productId === "object" && productId._id) {
        productId = productId._id;
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product id: ${productId}`,
        });
      }

      // ✅ Fetch product with populated category and seller
      const product = await Product.findById(productId)
        .populate("category", "name")
        .populate("seller", "fullName");

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found: ${productId}` });
      }
      if (product.quantity < item.qty) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }

      // Update product inventory
      product.quantity -= item.qty;
      product.sold += item.qty;
      product.buyers.push({
        user: buyer,
        qty: item.qty,
        boughtAt: new Date(),
      });
      await product.save();

      const qty = Number(item.qty);
      const priceAtPurchase = Number(item.price || product.price);

      // ✅ Create complete product snapshot
      const productSnapshot = {
        productId: product._id,
        snapshot: {
          name: product.name,
          description: product.description || "",
          weight: product.weight || "",
          category: product.category?._id || null,
          categoryName: product.category?.name || "Uncategorized",
          seller: product.seller?._id || null,
          sellerName: product.seller?.fullName || "Unknown Seller",
          image: {
            public_id: product.image?.public_id || "",
            url: product.image?.url || "",
          },
          status: product.status || "approved",
          metadata: {
            originalPrice: product.price,
            stockAtPurchase: product.quantity + item.qty, // Stock before this purchase
          },
        },
        qty,
        priceAtPurchase,
        // Backward compatibility
        product: product._id,
        productName: product.name,
        productCategory: product.category?.name || "Uncategorized",
        price: priceAtPurchase,
      };

      processedProducts.push(productSnapshot);
      subtotal += qty * priceAtPurchase;
    }

    const shipping = 1; // ₹1 shipping fee
    const total = subtotal + shipping;

    const order = await Order.create({
      buyer,
      products: processedProducts,
      address,
      total,
      paymentMethod: "Cash on Delivery",
      status: "Order Placed",
      snapshotVersion: "2.0",
    });

    order.statusHistory.push({ status: "Order Placed" });
    order.currentStatus = { status: "Order Placed", updatedAt: new Date() };
    await order.save();

    res.status(201).json({
      success: true,
      message: "✅ Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("❌ Order create error:", err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("products.product", "name images price category")
      .sort({ createdAt: -1 });

    // ❌ No auto-update — return as saved
    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Fetch orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to cancel this order" });
    }

    if (order.status === "Delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Delivered orders cannot be cancelled" });
    }

    if (order.status === "Cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already cancelled" });
    }

    // Restore product quantities
    for (let item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.qty;
        product.sold = Math.max(0, product.sold - item.qty);
        await product.save();
      }
    }

    // ✅ Process refund for online payments
    let refundDetails = null;
    if (order.paymentMethod === "Online Payment" && order.paymentDetails?.razorpay_payment_id) {
      try {
        // Import Razorpay at the top of the file if not already imported
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Create refund
        const refund = await razorpay.payments.refund(
          order.paymentDetails.razorpay_payment_id,
          {
            amount: Math.round(order.total * 100), // Amount in paise
            speed: "normal", // normal or optimum
            notes: {
              order_id: order._id.toString(),
              reason: "Order cancelled by customer",
            },
          }
        );

        refundDetails = {
          refund_id: refund.id,
          amount: refund.amount / 100, // Convert back to rupees
          status: refund.status,
          created_at: refund.created_at,
        };

        console.log("✅ Refund processed:", refundDetails);
      } catch (refundError) {
        console.error("❌ Refund Error:", refundError);
        // Don't fail the cancellation if refund fails
        // Admin can process manual refund
        refundDetails = {
          error: true,
          message: "Automatic refund failed. Manual refund required.",
          error_details: refundError.message,
        };
      }
    }

    order.status = "Cancelled";
    order.currentStatus = {
      status: "Cancelled",
      updatedAt: new Date(),
    };
    order.statusHistory.push({
      status: "Cancelled",
      changedAt: new Date(),
    });
    order.cancelledAt = new Date();

    // Store refund details if applicable
    if (refundDetails) {
      order.refundDetails = refundDetails;
    }

    await order.save();

    return res.json({
      success: true,
      message: order.paymentMethod === "Online Payment"
        ? refundDetails?.error
          ? "Order cancelled. Refund will be processed manually."
          : "Order cancelled successfully. Refund initiated."
        : "Order cancelled successfully",
      order,
      refund: refundDetails,
    });
  } catch (err) {
    console.error("❌ Cancel Order Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: err.message,
    });
  }
};

//
// ------------------- Admin Controllers -------------------
//
export const getAllOrders = async (req, res) => {
  try {
    let orders = await Order.find()
      .populate("buyer", "fullName email role")
      .populate("products.product", "name price category")
      .populate("assignedTo", "fullName email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Admin fetch orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch all orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "fullName email role")
      .populate("products.product", "name price category")
      .populate("assignedTo", "fullName email role");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Admin get order error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
};

//
// ------------------- Labour Controllers -------------------
//
export const assignOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (order.isAssigned)
      return res.status(400).json({ success: false, message: "Order already assigned" });

    order.assignedTo = userId;
    order.isAssigned = true;
    order.currentStatus = { status: "Confirmed", updatedAt: new Date() };
    order.status = "Confirmed";

    await order.save();

    res.json({
      success: true,
      message: "Order assigned successfully",
      order,
    });
  } catch (error) {
    console.error("❌ assignOrder error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!order.assignedTo || order.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not assigned to this order" });
    }

    if (!STATUS_FLOW.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.status = status;
    order.currentStatus = { status, updatedAt: new Date() };
    order.statusHistory.push({ status, changedBy: userId });

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Update status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// 🗑️ Delete Order (Admin Only)
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (err) {
    console.error("❌ Delete order error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: err.message
    });
  }
};
