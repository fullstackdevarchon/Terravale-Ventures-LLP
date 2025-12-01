import User from "../models/User.js";

// ✅ Get profile
export const getProfile = async (req, res) => {
  try {
    // Find the user by ID to ensure we have a proper Mongoose document
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure address object exists
    if (!user.address) {
      user.address = {
        type: "HOME",
        street: "",
        street2: "",
        city: "",
        district: "",
        state: "",
        country: "",
        pincode: "",
      };
      await user.save();
    }

    // Ensure secondaryAddress object exists
    if (!user.secondaryAddress) {
      user.secondaryAddress = {
        type: "OFFICE", // Assuming default type for secondary
        street: "",
        street2: "",
        city: "",
        district: "",
        state: "",
        country: "",
        pincode: "",
      };
      await user.save();
    }

    res.json({
      success: true,
      user: {
        fullName: user.fullName,
        email: user.email,
        address: user.address,
        secondaryAddress: user.secondaryAddress || {},
        phone: user.phone || "",
        alternatePhone: user.alternatePhone || "",
        profilePicture: user.profilePicture || "",
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Get Profile Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// ✅ Update profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, alternatePhone, address, secondaryAddress, profilePicture } = req.body;

    // Find the user by ID to ensure we have a proper Mongoose document
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user fields if provided
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (alternatePhone !== undefined) user.alternatePhone = alternatePhone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    // Update address if provided
    if (address) {
      user.address = {
        type: "HOME", // Force main address to be HOME
        street: address.street || user.address?.street || "",
        street2: address.street2 || user.address?.street2 || "",
        city: address.city || user.address?.city || "",
        district: address.district || user.address?.district || "",
        state: address.state || user.address?.state || "",
        country: address.country || user.address?.country || "",
        pincode: address.pincode || user.address?.pincode || "",
      };
    }

    // Update secondary address if provided
    if (secondaryAddress) {
      user.secondaryAddress = {
        type: secondaryAddress.type || user.secondaryAddress?.type || "OFFICE",
        street: secondaryAddress.street || user.secondaryAddress?.street || "",
        street2: secondaryAddress.street2 || user.secondaryAddress?.street2 || "",
        city: secondaryAddress.city || user.secondaryAddress?.city || "",
        district: secondaryAddress.district || user.secondaryAddress?.district || "",
        state: secondaryAddress.state || user.secondaryAddress?.state || "",
        country: secondaryAddress.country || user.secondaryAddress?.country || "",
        pincode: secondaryAddress.pincode || user.secondaryAddress?.pincode || "",
      };
    }

    // Mark the address as modified to ensure it gets saved
    user.markModified('address');
    user.markModified('secondaryAddress');

    // Save the updated user
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        address: updatedUser.address,
        secondaryAddress: updatedUser.secondaryAddress,
        phone: updatedUser.phone,
        alternatePhone: updatedUser.alternatePhone,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Update Profile Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update profile"
    });
  }
};
