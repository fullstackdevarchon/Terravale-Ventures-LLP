// src/pages/Seller/AddProduct.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaUpload, FaBalanceScale, FaBoxes, FaPlusCircle, FaRupeeSign, FaTag, FaAlignLeft, FaListAlt, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    weight: "",
    customWeight: "",
    quantity: 1,
    description: "",
    image: null,
    category: "",
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/v1/categories/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories.filter((c) => c.enabled));
        } else toast.error(data.message || "Failed to load categories");
      } catch {
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, [token]);

  // Handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be < 5MB");
        return;
      }
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
      return;
    }

    if (name === "quantity") {
      setForm({ ...form, quantity: Math.max(1, parseInt(value)) });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "seller") {
      toast.error("Only sellers can add products");
      return;
    }

    setLoading(true);

    try {
      if (!form.category) throw new Error("Please select a category");
      const finalWeight = form.weight === "custom" ? form.customWeight : form.weight;
      if (!finalWeight) throw new Error("Please select or enter weight");
      if (!form.image) throw new Error("Please upload product image");

      const formData = new FormData();
      Object.entries({ ...form, weight: finalWeight }).forEach(([k, v]) =>
        formData.append(k, v)
      );

      const res = await fetch("http://localhost:5000/api/v1/products/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Product submitted!");

      navigate("/seller/my-products");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayWeight = form.weight === "custom" ? form.customWeight : form.weight;

  return (
    <PageContainer>
      <div className="p-6 max-w-6xl mx-auto">

        <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl flex items-center justify-center gap-3">
          Add New Product
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* FORM CARD */}
          <div className="
            backdrop-blur-xl bg-white/10 border border-white/20 text-black
            rounded-2xl p-6 shadow-2xl hover:bg-white/20 transition
          ">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="font-semibold text-sm flex items-center gap-2">
                  <FaTag className="text-black" /> Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="
                    w-full mt-1 p-3 rounded-lg bg-white/50 text-black
                    border border-white/30 focus:ring-2 focus:ring-white
                  "
                />
              </div>

              {/* Price */}
              <div>
                <label className="font-semibold text-sm flex items-center gap-2">
                  <FaRupeeSign className="text-black" /> Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="
                    w-full mt-1 p-3 rounded-lg bg-white/50 text-black
                    border border-white/30 focus:ring-2 focus:ring-white
                  "
                />
              </div>

              {/* Weight & Quantity */}
              <div className="grid grid-cols-2 gap-5">

                {/* Weight */}
                <div>
                  <label className="font-semibold text-sm flex items-center gap-2">
                    <FaBalanceScale className="text-black" /> Weight
                  </label>

                  <select
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    className="
                      w-full bg-white/50 backdrop-blur-xl 
                      border border-white/40 rounded-lg shadow-md 
                      pl-4 pr-10 py-3 text-black font-semibold 
                      hover:bg-white/60 transition-all
                      appearance-none
                    "
                  >
                    <option value="">Select Weight</option>
                    <option value="250g">250 g</option>
                    <option value="500g">500 g</option>
                    <option value="1kg">1 kg</option>
                    <option value="2kg">2 kg</option>
                    <option value="custom">Custom Weight</option>
                  </select>

                  {form.weight === "custom" && (
                    <input
                      type="text"
                      name="customWeight"
                      value={form.customWeight}
                      onChange={handleChange}
                      placeholder="Enter weight"
                      className="
                        w-full mt-2 p-3 rounded-lg bg-white/50 text-black
                        border border-white/30 focus:ring-2 focus:ring-white
                      "
                    />
                  )}

                </div>

                {/* Quantity */}
                <div>
                  <label className="font-semibold text-sm flex items-center gap-2">
                    <FaBoxes className="text-black" /> Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    className="
                      w-full mt-1 p-3 rounded-lg bg-white/50 text-black
                      border border-white/30 focus:ring-2 focus:ring-white
                    "
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-sm flex items-center gap-2">
                  <FaAlignLeft className="text-black" /> Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="
                    w-full mt-1 p-3 rounded-lg bg-white/50 text-black
                    border border-white/30 focus:ring-2 focus:ring-white
                  "
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-semibold text-sm flex items-center gap-2">
                  <FaListAlt className="text-black" /> Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="
                    w-full mt-1 p-3 rounded-lg text-black
                    bg-white/50 border border-white/40 backdrop-blur-xl
                    focus:ring-2 focus:ring-white
                    hover:bg-white/60 transition
                  "
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <FaImage className="text-black" /> Product Image
                </label>

                <label
                  className="
                    cursor-pointer flex items-center justify-center gap-3
                    p-4 border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold
                  "
                >
                  <FaUpload /> Upload Image
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer
                "
              >
                {loading ? "Submitting..." : "➕ Add Product"}
              </button>
            </form>
          </div>

          {/* PREVIEW CARD */}
          <div className="
            backdrop-blur-xl bg-white/10 border border-white/20 text-black
            rounded-2xl p-6 shadow-2xl flex flex-col items-center
            hover:bg-white/20 transition
          ">
            {preview ? (
              <img
                src={preview}
                alt="Product"
                className="
                  w-48 h-48 object-cover rounded-xl border border-white/30 shadow-lg
                "
              />
            ) : (
              <div className="
                w-48 h-48 flex items-center justify-center
                border-2 border-dashed border-black/20 rounded-xl text-black/40
              ">
                No Image
              </div>
            )}

            <div className="text-center mt-4 space-y-2">
              <h3 className="text-xl font-semibold">{form.name || "Product Name"}</h3>
              <p className="text-gray-200 text-lg font-bold">
                {form.price ? `₹${form.price}` : "Price"}
              </p>
              <p className="text-black/80">⚖️ {displayWeight || "Weight"}</p>
              <p className="text-black/80">📦 {form.quantity || 1}</p>
              <p className="text-black/80">
                📑 {categories.find((c) => c._id === form.category)?.name || "Category"}
              </p>
              <p className="text-black/70 italic mt-2">
                {form.description || "Product description will appear here."}
              </p>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </PageContainer >
  );
}

export default AddProduct;
