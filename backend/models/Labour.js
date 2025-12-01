import mongoose from "mongoose";
import bcrypt from "bcrypt";

const labourSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["labour", "admin"], default: "labour" },
    phone: { type: String, default: "" },
    alternatePhone: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      street2: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    secondaryAddress: {
      street: { type: String, default: "" },
      street2: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// hash password before save
labourSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Labour", labourSchema);
