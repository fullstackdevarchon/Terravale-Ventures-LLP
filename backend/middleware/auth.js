import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Labour from "../models/Labour.js";

// Utility function to generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Utility function to set token in cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
};

export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let principal = null;

    // Labour users
    if (decoded.role === "labour") {
      principal = await Labour.findById(decoded.id).select("-password");
    }

    // Admin & Normal Users (both stored in User collection)
    if (!principal) {
      principal =
        (await User.findById(decoded.id).select("-pass")) ||
        (await User.findById(decoded.id).select("-password"));
    }

    if (!principal) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    // Normalize role
    const normalizedRole = String(principal.role || "").trim().toLowerCase();

    req.user = {
      _id: principal._id,
      id: principal._id,
      role: normalizedRole,
      email: principal.email,
      fullName: principal.fullName || principal.name || "",
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again.",
      error: error.message,
    });
  }
};

export const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No user found in request",
      });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Only ${allowedRoles.join(", ")} can perform this action`,
      });
    }

    next();
  };
};

