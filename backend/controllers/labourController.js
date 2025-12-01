import Labour from "../models/Labour.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../utils/cookieOptions.js"; // ✅ utility for cookies

// ✅ Add Labour
export const addLabour = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existing = await Labour.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const newLabour = new Labour({
      fullName,
      email,
      password, // 🔒 Model handles hashing
      role: role || "labour",
    });
    await newLabour.save();

    res.status(201).json({
      success: true,
      message: "Labour added successfully",
      user: {
        _id: newLabour._id,
        fullName: newLabour.fullName,
        email: newLabour.email,
        role: newLabour.role,
      },
    });
  } catch (error) {
    console.error("Add Labour Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get All Labours
export const getLabours = async (req, res) => {
  try {
    const labours = await Labour.find().select("-password");
    res.json({ success: true, labours });
  } catch (error) {
    console.error("Get Labours Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Delete Labour
export const deleteLabour = async (req, res) => {
  try {
    const { id } = req.params;
    await Labour.findByIdAndDelete(id);
    res.json({ success: true, message: "Labour deleted successfully" });
  } catch (error) {
    console.error("Delete Labour Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Login Labour/Admin
export const loginLabour = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Attempting login for:", email);

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await Labour.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment variables");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ loginLabour error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// ✅ Get Labour Profile
export const getProfile = async (req, res) => {
  try {
    const labour = await Labour.findById(req.user.id).select("-password");
    if (!labour) {
      return res.status(404).json({ success: false, message: "Labour not found" });
    }
    res.json({ success: true, user: labour });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Update Labour Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, alternatePhone, address, secondaryAddress, profilePicture } = req.body;
    const labour = await Labour.findById(req.user.id);

    if (!labour) {
      return res.status(404).json({ success: false, message: "Labour not found" });
    }

    if (fullName) labour.fullName = fullName.toUpperCase();
    if (phone) labour.phone = phone;
    if (alternatePhone) labour.alternatePhone = alternatePhone;
    if (profilePicture) labour.profilePicture = profilePicture;

    if (address) {
      labour.address = {
        street: (address.street || labour.address?.street || "").toUpperCase(),
        street2: (address.street2 || labour.address?.street2 || "").toUpperCase(),
        city: (address.city || labour.address?.city || "").toUpperCase(),
        district: (address.district || labour.address?.district || "").toUpperCase(),
        state: (address.state || labour.address?.state || "").toUpperCase(),
        country: (address.country || labour.address?.country || "").toUpperCase(),
        pincode: address.pincode || labour.address?.pincode || "",
      };
    }

    if (secondaryAddress) {
      labour.secondaryAddress = {
        street: (secondaryAddress.street || labour.secondaryAddress?.street || "").toUpperCase(),
        street2: (secondaryAddress.street2 || labour.secondaryAddress?.street2 || "").toUpperCase(),
        city: (secondaryAddress.city || labour.secondaryAddress?.city || "").toUpperCase(),
        district: (secondaryAddress.district || labour.secondaryAddress?.district || "").toUpperCase(),
        state: (secondaryAddress.state || labour.secondaryAddress?.state || "").toUpperCase(),
        country: (secondaryAddress.country || labour.secondaryAddress?.country || "").toUpperCase(),
        pincode: secondaryAddress.pincode || labour.secondaryAddress?.pincode || "",
      };
    }

    await labour.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: labour,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
