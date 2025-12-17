import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer is required"],
    },
    products: [
      {
        // ✅ Reference to original product (may be null if deleted)
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false, // Optional for backward compatibility
        },

        // ✅ Complete product snapshot at time of purchase
        snapshot: {
          name: { type: String, required: false }, // Optional for v1.0 orders
          description: { type: String, default: "" },
          weight: { type: String, default: "" },
          category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
          },
          categoryName: { type: String, default: "Uncategorized" }, // Denormalized for quick access
          seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          sellerName: { type: String, default: "" }, // Denormalized
          image: {
            public_id: { type: String },
            url: { type: String },
          },
          status: { type: String, default: "approved" },
          // Store any additional metadata
          metadata: { type: mongoose.Schema.Types.Mixed },
        },

        // ✅ Purchase details
        qty: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        priceAtPurchase: {
          type: Number,
          required: false, // Optional for backward compatibility
          min: [0, "Price cannot be negative"],
        },

        // ✅ Backward compatibility (deprecated, use snapshot instead)
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productName: { type: String },
        productCategory: { type: String },
        price: { type: Number },
      },
    ],
    address: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      alternatePhone: { type: String },
      street: { type: String, required: true },
      street2: { type: String },
      city: { type: String, required: true },
      district: { type: String },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zip: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Online Payment"],
      default: "Cash on Delivery",
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Pending", "Order Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Order Placed",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    statusHistory: [{
      status: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    currentStatus: {
      status: { type: String, default: "Order Placed" },
      updatedAt: { type: Date, default: Date.now }
    },
    cancelledAt: { type: Date },
    isAssigned: { type: Boolean, default: false },
    paymentDetails: {
      razorpay_order_id: { type: String },
      razorpay_payment_id: { type: String },
      razorpay_signature: { type: String },
    },
    refundDetails: {
      refund_id: { type: String },
      amount: { type: Number },
      status: { type: String },
      created_at: { type: Number },
      error: { type: Boolean },
      message: { type: String },
      error_details: { type: String },
    },
    // ✅ Snapshot metadata
    snapshotVersion: {
      type: String,
      default: "2.0", // Version of snapshot schema
    },
  },
  { timestamps: true }
);

// ✅ Index for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "products.productId": 1 });

export default mongoose.model("Order", orderSchema);
