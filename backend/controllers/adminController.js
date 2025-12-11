import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../utils/cookieOptions.js";

// ✅ Admin Register
export const adminRegister = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        // Check if admin already exists
        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Create new admin
        const newAdmin = new Admin({
            name,
            email,
            password, // 🔒 Model handles hashing
            role: "admin",
            phone: phone || "",
        });
        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: {
                _id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                phone: newAdmin.phone,
            },
        });
    } catch (error) {
        console.error("Admin Register Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// ✅ Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Attempting admin login for:", email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }

        const admin = await Admin.findOne({ email }).select("+password");
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("🔑 Password match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("❌ Missing JWT_SECRET in environment variables");
            return res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
        }

        const token = jwt.sign(
            { id: admin._id.toString(), role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone,
            },
            token,
        });
    } catch (error) {
        console.error("❌ adminLogin error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// ✅ Get All Admins
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select("-password");
        res.json({
            success: true,
            admins,
        });
    } catch (error) {
        console.error("Get All Admins Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// ✅ Get Admin By ID
export const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id).select("-password");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        res.json({
            success: true,
            admin,
        });
    } catch (error) {
        console.error("Get Admin By ID Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// ✅ Update Admin
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, password } = req.body;

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        // Update fields
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;
        if (password) admin.password = password; // Will be hashed by pre-save hook

        await admin.save();

        res.json({
            success: true,
            message: "Admin updated successfully",
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone,
            },
        });
    } catch (error) {
        console.error("Update Admin Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// ✅ Delete Admin
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await Admin.findByIdAndDelete(id);
        res.json({
            success: true,
            message: "Admin deleted successfully",
        });
    } catch (error) {
        console.error("Delete Admin Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
