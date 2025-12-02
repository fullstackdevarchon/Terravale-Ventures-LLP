// server.js
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

// ===================================================
// CORS
// ===================================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      process.env.FRONTEND_URL, // optional for production frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ===================================================
// API ROUTES
// ===================================================
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

// ===================================================
// ❗ REMOVE STATIC FRONTEND (Important for Render)
// ===================================================
// ❌ Removed this because Render backend DOES NOT contain frontend files
// app.use(express.static(...));
// app.get("*", ...);

// Instead, just show a simple API root message:
app.get("/", (req, res) => {
  res.send("Terravale Backend API is running 🚀");
});

// ===================================================
// MONGODB CONNECTION
// ===================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ===================================================
// SOCKET.IO SETUP
// ===================================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      process.env.FRONTEND_URL,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// ===================================================
// WEB PUSH CONFIG
// ===================================================
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error("❌ Missing VAPID keys in .env file!");
  process.exit(1);
}

webpush.setVapidDetails(
  "mailto:admin@Terravale Ventures LLP",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ===================================================
// SOCKET EVENTS
// ===================================================
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("joinRoom", ({ id, role }) => {
    if (role === "admin") {
      socket.join("admin");
      console.log("🟢 Admin joined room");
    } else if (id) {
      socket.join(id);
      console.log(`🟢 Client joined room: ${id}`);
    }
  });

  socket.on("sendNotification", async (data) => {
    console.log("📨 Notification received:", data);

    const { role, title, message } = data;
    const payload = JSON.stringify({ title, body: message });

    // Real-time notification
    if (role === "admin") io.to("admin").emit("receiveNotification", data);
    else io.to(role).emit("receiveNotification", data);

    // Web push
    try {
      const { default: Subscription } = await import("./models/Subscription.js");
      const subs = await Subscription.find({ role });

      subs.forEach((sub) => {
        webpush
          .sendNotification(sub, payload)
          .then(() => console.log("📬 Web Push sent"))
          .catch((err) => console.error("Push error:", err));
      });
    } catch (err) {
      console.error("❌ Error sending push:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🛑 Client disconnected:", socket.id);
  });
});

// ===================================================
// START SERVER
// ===================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
