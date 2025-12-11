import express from "express";
import {
    adminRegister,
    adminLogin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
} from "../controllers/adminController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";
import {
    validateAdminRegistration,
    validateAdminLogin,
    validateAdminUpdate,
    validateMongoId,
} from "../middleware/adminValidation.js";

const router = express.Router();

/**
 * ========================
 * 🔑 Authentication Routes
 * ========================
 */

// Admin Register
router.post("/register", validateAdminRegistration, adminRegister); // POST /api/admin/register

// Admin Login
router.post("/login", validateAdminLogin, adminLogin); // POST /api/admin/login

/**
 * ========================
 * 👤 Admin Management
 * ========================
 */

// Get All Admins (Admin only)
router.get(
    "/all",
    isAuthenticated,
    authorizeRoles(["admin"]),
    getAllAdmins
); // GET /api/admin/all

// Get Admin By ID (Admin only)
router.get(
    "/:id",
    validateMongoId,
    isAuthenticated,
    authorizeRoles(["admin"]),
    getAdminById
); // GET /api/admin/:id

// Update Admin (Admin only)
router.put(
    "/:id",
    validateMongoId,
    validateAdminUpdate,
    isAuthenticated,
    authorizeRoles(["admin"]),
    updateAdmin
); // PUT /api/admin/:id

// Delete Admin (Admin only)
router.delete(
    "/:id",
    validateMongoId,
    isAuthenticated,
    authorizeRoles(["admin"]),
    deleteAdmin
); // DELETE /api/admin/:id

/**
 * ========================
 * 📊 Dashboard & Utilities
 * ========================
 */

// Get Dashboard Stats (Admin only)
router.get(
    "/dashboard-stats",
    isAuthenticated,
    authorizeRoles(["admin"]),
    async (req, res) => {
        try {
            // Mock data - replace with real database queries
            const stats = {
                totalProducts: 150,
                pendingSellers: 8,
                totalRevenue: 45000,
                inventoryItems: 180,
                totalOrders: 45,
                activeUsers: 250,
            };

            res.status(200).json({ success: true, stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
); // GET /api/admin/dashboard-stats

// Send Notification (Admin only)
router.post(
    "/notify",
    isAuthenticated,
    authorizeRoles(["admin"]),
    async (req, res) => {
        try {
            const io = req.app.get("io"); // Get Socket.IO instance
            const { role, title, message } = req.body;

            if (!role || !title || !message) {
                return res.status(400).json({
                    success: false,
                    message: "Role, title, and message are required",
                });
            }

            // Emit the notification to the specified role
            io.to(role).emit("receiveNotification", { title, message });
            console.log("📣 Notification sent:", { role, title, message });

            res.status(200).json({
                success: true,
                message: `Notification sent to ${role}`,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
); // POST /api/admin/notify

export default router;
