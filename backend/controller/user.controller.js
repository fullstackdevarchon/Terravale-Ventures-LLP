// controllers/user.controller.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔥 FIXED COOKIE OPTIONS FOR RENDER + CROSS DOMAIN
const cookieOptions = {
  httpOnly: true,
  secure: true,         // Must be TRUE on Render (HTTPS)
  sameSite: "none",     // REQUIRED for frontend ↔ backend cookie sharing
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// =======================
// Get all users (Admin protected)
// =======================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-pass");
    res.json(users);
  } catch (error) {
    console.error("❌ getUsers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Register new user
// =======================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, pass, role } = req.body;

    const validRoles = ["buyer", "seller", "admin"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({
      fullName,
      email,
      pass,
      role,
      isApproved: role === "seller" ? false : true,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ registerUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Login user
// =======================
export const loginUser = async (req, res) => {
  try {
    const { email, pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+pass");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 Set cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =======================
// Admin login
// =======================
export const adminLogin = async (req, res) => {
  try {
    const { email, pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+pass");
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 Set cookie properly for admin
    res.cookie("token", token, cookieOptions);

    return res.json({
      message: "Admin login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("❌ adminLogin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Logout
// =======================
export const logoutUser = (req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
  res.json({ message: "Logged out successfully" });
};

// =======================
// Verify JWT
// =======================
export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    res.json({
      message: "Token is valid",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
