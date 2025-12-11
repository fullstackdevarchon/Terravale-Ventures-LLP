import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Labour from "../models/Labour.js";
import Admin from "../models/Admin.js"; // ✅ Added Admin model

// ================================
// Generate Token (Helper Function)
// ================================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ================================
// Set Cookie with JWT
// ================================
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,     // MUST be true in Render
    sameSite: "none", // REQUIRED for cross-domain cookies
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// ================================
// AUTHENTICATION MIDDLEWARE
// ================================
export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Get Token
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

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let principal = null;

    // Check Admin Model
    if (decoded.role === "admin") {
      principal = await Admin.findById(decoded.id).select("-password");
    }

    // Labour Model
    if (!principal && decoded.role === "labour") {
      principal = await Labour.findById(decoded.id).select("-password");
    }

    // User/Buyer/Seller (same model)
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

    // 3. Normalize role
    const normalizedRole = String(principal.role || "")
      .trim()
      .toLowerCase();

    // 4. Attach User to Request
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

// ================================
// AUTHORIZATION MIDDLEWARE
// ================================
export const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No user found.",
      });
    }

    // Normalize roles
    const userRole = String(req.user.role || "")
      .trim()
      .toLowerCase();

    const allowedRoles = roles.map((role) =>
      String(role).trim().toLowerCase()
    );

    console.log("ROLE CHECK:", userRole);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Only ${allowedRoles.join(", ")} allowed.`,
      });
    }

    next();
  };
};

export { generateToken, setTokenCookie };
