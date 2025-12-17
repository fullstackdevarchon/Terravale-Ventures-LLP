// =========================================
//  TERRAVALE BACKEND (UPDATED FOR ADMIN + LABOUR)
// =========================================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import webpush from "web-push";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminRoutes from "./routes/adminRoutes.js"; // ✅ Updated to new admin routes
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import labourRoutes from "./routes/labourRoutes.js";
import forgotRoutes from "./routes/forgotRoutes.js";
import pushRoutes from "./routes/notificationRoutes.js";
import googleRoutes from "./routes/google.routes.js";
import paymentRoutes from "./routes/paymentRoutes.js"; // ✅ Added payment routes

dotenv.config();
const app = express();

// =========================================
// 🔒 SECURE CORS CONFIGURATION
// =========================================

/**
 * SECURITY BEST PRACTICES:
 * 1. ✅ Whitelist-based origin validation (NO wildcards)
 * 2. ✅ Strict origin checking with credentials
 * 3. ✅ No Access-Control-Allow-Origin: * when credentials: true
 * 4. ✅ Explicit method and header whitelisting
 * 5. ✅ Environment-based configuration for flexibility
 */

// Define allowed origins (whitelist approach)
const allowedOrigins = [
  // Local development origins
  "http://localhost:5173",           // Main frontend dev
  "http://localhost:5174",           // Customer frontend dev
  "http://localhost:5175",           // Admin frontend dev

  // Production origins
  "https://terravale-main.onrender.com",    // Main customer frontend
  "https://terravale-admin.onrender.com",   // Admin dashboard
  "https://terravale-labour.onrender.com",  // Labour portal

  // Optional: Environment-based override (for custom domains)
  process.env.FRONTEND_URL?.replace(/\/+$/, ""),
  process.env.ADMIN_URL?.replace(/\/+$/, ""),
  process.env.LABOUR_URL?.replace(/\/+$/, ""),
].filter(Boolean); // Remove undefined/null values

/**
 * CORS Origin Validator
 * Validates incoming requests against the whitelist
 * @param {string} origin - The origin of the incoming request
 * @param {function} callback - Callback function (error, allow)
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    // ⚠️ SECURITY NOTE: Remove this in production if you don't need it
    if (!origin) {
      // For development: allow no-origin requests
      // For production: uncomment the line below to block
      // return callback(new Error('Origin not allowed by CORS'), false);
      return callback(null, true);
    }

    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Origin is allowed
    } else {
      // Log unauthorized access attempts for security monitoring
      console.warn(`🚨 CORS BLOCKED: Unauthorized origin attempted access: ${origin}`);
      callback(new Error(`CORS policy: Origin ${origin} is not allowed`), false);
    }
  },

  // Enable credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  // Allowed headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  // Expose custom headers to the client
  exposedHeaders: ["Set-Cookie"],

  // Cache preflight requests for 24 hours (reduce OPTIONS requests)
  maxAge: 86400,

  // Allow preflight to succeed
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional security: Handle preflight requests explicitly
app.options("*", cors(corsOptions));

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
app.use("/api/payment", paymentRoutes); // ✅ Added payment routes

app.get("/", (req, res) => {
  res.send("🚀 Terravale Backend API is running successfully!");
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
});
