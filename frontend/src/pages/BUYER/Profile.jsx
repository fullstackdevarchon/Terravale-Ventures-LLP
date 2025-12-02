import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaLocationArrow,
  FaHashtag,
  FaSave,
  FaEdit,
  FaBuilding,
  FaHome,
  FaBriefcase,
  FaRoad,
  FaMobileAlt,
} from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: {
      type: "HOME",
      street: "",
      street2: "",
      city: "",
      district: "",
      state: "",
      country: "INDIA",
      pincode: "",
    },
    secondaryAddress: {
      type: "OFFICE",
      street: "",
      street2: "",
      city: "",
      district: "",
      state: "",
      country: "INDIA",
      pincode: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    if (!token) {
      toast.error("PLEASE LOGIN TO VIEW PROFILE");
      navigate("/login/buyer");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.user) {
        setFormData({
          fullName: data.user.fullName?.toUpperCase() || "",
          email: data.user.email?.toUpperCase() || "",
          phone: data.user.phone || "",
          alternatePhone: data.user.alternatePhone || "",
          address: {
            type: "HOME",
            street: data.user.address?.street?.toUpperCase() || "",
            street2: data.user.address?.street2?.toUpperCase() || "",
            city: data.user.address?.city?.toUpperCase() || "",
            district: data.user.address?.district?.toUpperCase() || "",
            state: data.user.address?.state?.toUpperCase() || "",
            country: data.user.address?.country?.toUpperCase() || "INDIA",
            pincode: data.user.address?.pincode || "",
          },
          secondaryAddress: {
            type: data.user.secondaryAddress?.type || "OFFICE",
            street: data.user.secondaryAddress?.street?.toUpperCase() || "",
            street2: data.user.secondaryAddress?.street2?.toUpperCase() || "",
            city: data.user.secondaryAddress?.city?.toUpperCase() || "",
            district: data.user.secondaryAddress?.district?.toUpperCase() || "",
            state: data.user.secondaryAddress?.state?.toUpperCase() || "",
            country: data.user.secondaryAddress?.country?.toUpperCase() || "INDIA",
            pincode: data.user.secondaryAddress?.pincode || "",
          },
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login/buyer");
      }
      toast.error(err.response?.data?.message || "FAILED TO LOAD PROFILE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Simple field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  // Main address field change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value.toUpperCase(),
      },
    }));
  };

  // Secondary address field change
  const handleSecondaryAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      secondaryAddress: {
        ...prev.secondaryAddress,
        [name]: value.toUpperCase(),
      },
    }));
  };

  // Validation
  const validateForm = () => {
    // Full Name
    if (!formData.fullName.trim()) {
      toast.error("ENTER FULL NAME");
      return false;
    }
    if (formData.fullName.trim().length < 3) {
      toast.error("FULL NAME MUST BE AT LEAST 3 CHARACTERS");
      return false;
    }

    // Phone (Indian Style: 10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("ENTER VALID 10 DIGIT PHONE NUMBER");
      return false;
    }

    // Alternate Phone (Optional, but if present must be 10 digits)
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
      toast.error("ENTER VALID 10 DIGIT ALTERNATE PHONE NUMBER");
      return false;
    }

    // Main Address Validation
    if (!formData.address.street.trim()) {
      toast.error("ENTER MAIN ADDRESS STREET");
      return false;
    }
    if (!formData.address.city.trim()) {
      toast.error("ENTER MAIN ADDRESS CITY");
      return false;
    }
    if (!/^\d{6}$/.test(formData.address.pincode)) {
      toast.error("ENTER VALID 6 DIGIT PINCODE FOR MAIN ADDRESS");
      return false;
    }

    // Secondary Address Validation (Optional)
    // If any field in secondary address is filled, validate the required ones (Street, City, Pincode)
    const sec = formData.secondaryAddress;
    if (sec.street || sec.street2 || sec.city || sec.district || sec.state || sec.pincode) {
      if (!sec.street.trim()) {
        toast.error("ENTER SECONDARY ADDRESS STREET");
        return false;
      }
      if (!sec.city.trim()) {
        toast.error("ENTER SECONDARY ADDRESS CITY");
        return false;
      }
      if (!/^\d{6}$/.test(sec.pincode)) {
        toast.error("ENTER VALID 6 DIGIT PINCODE FOR SECONDARY ADDRESS");
        return false;
      }
    }

    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return false;

    try {
      setSaving(true);
      await axios.put("http://localhost:5000/api/profile/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("PROFILE UPDATED SUCCESSFULLY");
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login/buyer");
      }
      toast.error(err.response?.data?.message || "FAILED TO UPDATE PROFILE");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await saveProfile();
    if (ok) setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white"></div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen px-4 py-10">

        {/* CARD */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 md:p-10 shadow-2xl">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-center pb-5 border-b border-white/20 gap-4">
            <h1 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
              MY PROFILE
            </h1>

            <button
              onClick={toggleEdit}
              className="px-6 py-2 border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              {isEditing ? <><FaSave /> CANCEL</> : <><FaEdit /> EDIT PROFILE</>}
            </button>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6"
          >
            {/* --- PERSONAL DETAILS --- */}
            <div className="sm:col-span-2">
              <h2 className="text-xl font-bold text-black mb-4 border-b border-white/10 pb-2">PERSONAL DETAILS</h2>
            </div>

            <InputField
              label="FULL NAME"
              icon={<FaUser className="text-black" />}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <InputField
              label="EMAIL"
              icon={<FaEnvelope className="text-black" />}
              name="email"
              value={formData.email}
              disabled
            />

            <InputField
              label="PHONE"
              icon={<FaPhone className="text-black" />}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <InputField
              label="ALTERNATE PHONE (OPTIONAL)"
              icon={<FaMobileAlt className="text-black" />}
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              disabled={!isEditing}
            />

            {/* --- MAIN ADDRESS (HOME) --- */}
            <div className="sm:col-span-2 mt-6">
              <h2 className="text-xl font-bold text-black mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <FaHome className="text-black" /> PERMANENT ADDRESS (HOME)
              </h2>
            </div>

            <InputField
              label="STREET"
              icon={<FaMapMarkerAlt className="text-black" />}
              name="street"
              value={formData.address.street}
              onChange={handleAddressChange}
              disabled={!isEditing}
              required
              full
            />

            <InputField
              label="STREET 2 (OPTIONAL)"
              icon={<FaRoad className="text-black" />}
              name="street2"
              value={formData.address.street2}
              onChange={handleAddressChange}
              disabled={!isEditing}
              full
            />

            <InputField
              label="CITY"
              icon={<FaCity className="text-black" />}
              name="city"
              value={formData.address.city}
              onChange={handleAddressChange}
              disabled={!isEditing}
              required
            />

            <InputField
              label="DISTRICT"
              icon={<FaLocationArrow className="text-black" />}
              name="district"
              value={formData.address.district}
              onChange={handleAddressChange}
              disabled={!isEditing}
            />

            <InputField
              label="STATE"
              icon={<FaGlobe className="text-black" />}
              name="state"
              value={formData.address.state}
              onChange={handleAddressChange}
              disabled={!isEditing}
            />

            <InputField
              label="COUNTRY"
              icon={<FaGlobe className="text-black" />}
              name="country"
              value={formData.address.country}
              onChange={handleAddressChange}
              disabled={!isEditing}
            />

            <InputField
              label="PINCODE"
              icon={<FaHashtag className="text-black" />}
              name="pincode"
              value={formData.address.pincode}
              onChange={handleAddressChange}
              disabled={!isEditing}
              required
            />

            {/* --- SECONDARY ADDRESS --- */}
            <div className="sm:col-span-2 mt-6">
              <h2 className="text-xl font-bold text-black mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <FaBuilding className="text-black" /> SECONDARY ADDRESS (OPTIONAL)
              </h2>
            </div>

            {/* ADDRESS TYPE DROPDOWN */}
            <div className="sm:col-span-2">
              <label className="block text-black text-sm font-bold mb-1 tracking-wider">
                ADDRESS TYPE
              </label>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 sm:p-4 shadow-xl">
                <span className="text-black text-lg">
                  {formData.secondaryAddress.type === "APARTMENT" ? <FaBuilding className="text-black" /> : <FaBriefcase className="text-black" />}
                </span>
                <select
                  name="type"
                  value={formData.secondaryAddress.type}
                  onChange={handleSecondaryAddressChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent text-black uppercase outline-none disabled:opacity-50 text-sm sm:text-base [&>option]:text-black"
                >
                  <option value="OFFICE">OFFICE</option>
                  <option value="APARTMENT">APARTMENT</option>
                </select>
              </div>
            </div>

            <InputField
              label="STREET"
              icon={<FaMapMarkerAlt className="text-black" />}
              name="street"
              value={formData.secondaryAddress.street}
              onChange={handleSecondaryAddressChange}
              disabled={!isEditing}
              full
            />

            <InputField
              label="STREET 2 (OPTIONAL)"
              icon={<FaRoad className="text-black" />}
              name="street2"
              value={formData.secondaryAddress.street2}
              onChange={handleSecondaryAddressChange}
              disabled={!isEditing}
              full
            />

            <InputField
              label="CITY"
              icon={<FaCity className="text-black" />}
              name="city"
              value={formData.secondaryAddress.city}
              onChange={handleSecondaryAddressChange}
              disabled={!isEditing}
            />

            <InputField
              label="DISTRICT"
              icon={<FaLocationArrow className="text-black" />}
              name="district"
              value={formData.secondaryAddress.district}
              onChange={handleSecondaryAddressChange}
              disabled={!isEditing}
            />

            <InputField
              label="STATE"
              icon={<FaGlobe className="text-black" />}
              name="state"
              value={formData.secondaryAddress.state}
              onChange={handleSecondaryAddressChange}
              disabled={!isEditing}
            />

            <InputField
              label="COUNTRY"
              icon={<FaGlobe className="text-black" />}
              name="country"
              value={formData.secondaryAddress.country}
              onChange={handleSecondaryAddressChange}
              disabled={!isEditing}
            />

            <InputField
              label="PINCODE"
              icon={<FaHashtag className="text-black" />}
              name="pincode"
              value={formData.secondaryAddress.pincode}
              onChange={handleSecondaryAddressChange}
              disabled={!isEditing}
            />

            {/* SAVE BUTTON */}
            {isEditing && (
              <div className="col-span-1 sm:col-span-2 flex justify-center sm:justify-end pt-6 border-t border-white/20">
                <button
                  type="submit"
                  className="px-8 py-3 border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
                  disabled={saving}
                >
                  {saving ? "SAVING..." : <><FaSave /> SAVE</>}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </PageContainer>
  );
};

// INPUT COMPONENT
const InputField = ({
  label,
  icon,
  name,
  value,
  onChange,
  disabled,
  required,
  full,
}) => (
  <div className={`${full ? "sm:col-span-2" : ""}`}>
    <label className="block text-black text-sm font-bold mb-1 tracking-wider">
      {label} {required && "*"}
    </label>

    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 sm:p-4 shadow-xl">
      <span className="text-black text-lg">{icon}</span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-transparent text-black uppercase outline-none disabled:opacity-50 text-sm sm:text-base placeholder-gray-500"
      />
    </div>
  </div>
);

export default Profile;
