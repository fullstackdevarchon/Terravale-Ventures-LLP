import express from "express";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentDetails,
} from "../controllers/paymentController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

/**
 * ========================
 * 💳 Razorpay Payment Routes
 * ========================
 */

// Create Razorpay Order
router.post("/create-order", isAuthenticated, createRazorpayOrder);

// Verify Razorpay Payment
router.post("/verify", isAuthenticated, verifyRazorpayPayment);

// Get Payment Details
router.get("/:paymentId", isAuthenticated, getPaymentDetails);

export default router;
