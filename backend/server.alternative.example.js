/**
 * 🔒 ALTERNATIVE SERVER.JS IMPLEMENTATION
 * 
 * This file shows how to use the reusable CORS middleware module.
 * 
 * To use this approach:
 * 1. Replace the CORS configuration in server.js with this code
 * 2. The middleware/corsConfig.js module handles all CORS logic
 * 3. Easier to maintain and reuse across projects
 */

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import webpush from "web-push";

// Import reusable CORS middleware
import {
    configureCORS,
    getOriginsFromEnv,
    validateCORSConfig,
    corsErrorHandler
} from "./middleware/corsConfig.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import labourRoutes from "./routes/labourRoutes.js";
import forgotRoutes from "./routes/forgotRoutes.js";
import pushRoutes from "./routes/notificationRoutes.js";
import googleRoutes from "./routes/google.routes.js";

dotenv.config();
const app = express();

// =========================================
// 🔒 CORS CONFIGURATION (REUSABLE MODULE)
// =========================================

// Get allowed origins from environment variables
const allowedOrigins = [
    // Local development
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",

    // Production
    "https://terravale-main.onrender.com",
    "https://terravale-admin.onrender.com",
    "https://terravale-labour.onrender.com",

    // Environment variables (optional)
    ...getOriginsFromEnv(),
];

// Validate CORS configuration
const validation = validateCORSConfig(allowedOrigins);
if (!validation.isValid) {
    console.error('❌ CORS Configuration Errors:', validation.errors);
    process.exit(1);
}
if (validation.warnings.length > 0) {
    console.warn('⚠️ CORS Configuration Warnings:', validation.warnings);
}

// Configure CORS
configureCORS(app, {
    allowedOrigins,
    allowNoOrigin: process.env.NODE_ENV !== 'production', // Block no-origin in production
    enableLogging: true,
});

// =========================================
// 📌 MIDDLEWARE
// =========================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// =========================================
// 📌 ROUTES
// =========================================
app.use("/api/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/labours", labourRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/forgot", forgotRoutes);
app.use("/api/notifications", pushRoutes);
app.use("/api/auth/google", googleRoutes);

app.get("/", (req, res) => {
    res.send("🚀 Terravale Backend API is running successfully!");
});

// =========================================
// 📌 ERROR HANDLING
// =========================================
app.use(corsErrorHandler()); // Handle CORS errors

app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message
    });
});

// =========================================
// 📌 MONGODB
// =========================================
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));

// =========================================
// 📌 SOCKET.IO
// =========================================
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.set("io", io);

// =========================================
// 📌 WEB PUSH
// =========================================
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error("❌ Missing VAPID Keys");
    process.exit(1);
}

webpush.setVapidDetails(
    "mailto:admin@Terravale Ventures LLP",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// =========================================
// 📌 SOCKET EVENTS
// =========================================
io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("joinRoom", ({ id, role }) => {
        if (role === "admin") {
            socket.join("admin");
            console.log("🟢 Admin joined room");
        } else {
            socket.join(id);
            console.log(`🟢 User joined room: ${id}`);
        }
    });

    socket.on("sendNotification", async (data) => {
        console.log("📨 Notification received:", data);

        const { role, title, message } = data;
        const payload = JSON.stringify({ title, body: message });

        if (role === "admin") io.to("admin").emit("receiveNotification", data);
        else io.to(role).emit("receiveNotification", data);

        try {
            const { default: Subscription } = await import("./models/Subscription.js");
            const subs = await Subscription.find({ role });

            subs.forEach((sub) => {
                webpush
                    .sendNotification(sub, payload)
                    .catch((err) => console.error("Push Error:", err));
            });
        } catch (err) {
            console.error("❌ Push Notification Error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("🛑 Client disconnected:", socket.id);
    });
});

// =========================================
// 🚀 START SERVER
// =========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
