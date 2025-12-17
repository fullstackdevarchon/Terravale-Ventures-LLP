import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * POST /api/payment/create-order
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount",
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1, // Auto capture payment
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID, // Send key_id to frontend
        });
    } catch (error) {
        console.error("❌ Razorpay Order Creation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order",
            error: error.message,
        });
    }
};

/**
 * Verify Razorpay Payment
 * POST /api/payment/verify
 */
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData, // Contains products, address, etc.
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // Payment verified successfully, create order in database
        const { products, address } = orderData;
        const buyer = req.user?._id || req.user?.id;

        if (!buyer) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
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

        // Process products and update inventory
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
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${productId}`,
                });
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
                        stockAtPurchase: product.quantity + item.qty,
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

        // Create order in database
        const order = await Order.create({
            buyer,
            products: processedProducts,
            address,
            total,
            paymentMethod: "Online Payment",
            status: "Order Placed",
            paymentDetails: {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            },
            snapshotVersion: "2.0",
        });

        order.statusHistory.push({ status: "Order Placed" });
        order.currentStatus = { status: "Order Placed", updatedAt: new Date() };
        await order.save();

        res.status(201).json({
            success: true,
            message: "✅ Payment verified and order placed successfully",
            order,
        });
    } catch (error) {
        console.error("❌ Payment Verification Error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message,
        });
    }
};

/**
 * Get Payment Details
 * GET /api/payment/:paymentId
 */
export const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await razorpay.payments.fetch(paymentId);

        res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error("❌ Fetch Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment details",
            error: error.message,
        });
    }
};
