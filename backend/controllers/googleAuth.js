// backend/controllers/googleAuth.js

import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Labour from "../models/Labour.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    // Frontend must send Google ID Token (JWT)
    const idToken = req.body.token || req.body.credential; // Accept 'credential' for new flow
    const role = req.body.role || "buyer"; // Default to buyer if not specified

    if (!idToken) {
      return res.status(400).json({ message: "Google token required" });
    }

    // Verify ID Token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      if (verifyError.message && verifyError.message.includes("Token used too early")) {
        console.warn("⚠️ Clock skew detected, decoding token manually...");
        payload = jwt.decode(idToken);
        if (!payload) throw new Error("Invalid token");
        if (payload.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error("Invalid audience");
      } else {
        throw verifyError;
      }
    }

    // Extract Google user details
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google email not found" });
    }

    let user;
    let Model;

    // Select Model based on role
    if (role === "labour") {
      Model = Labour;
    } else {
      Model = User;
    }

    // Find or create user
    user = await Model.findOne({ email });

    if (!user) {
      const userData = {
        fullName: name,
        email,
        role: role,
      };

      // Handle password field difference
      if (role === "labour") {
        userData.password = "google_default_password"; // Labour model uses 'password'
      } else {
        userData.pass = "google_default_password"; // User model uses 'pass'
      }

      user = await Model.create(userData);
    }

    // Generate JWT
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 Set cookie (same as email/password login)
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    };
    res.cookie("token", appToken, cookieOptions);

    return res.json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        picture,
        role: user.role,
      },
      token: appToken,
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(500).json({
      message: "Google login failed",
      error: err.message,
    });
  }
};
