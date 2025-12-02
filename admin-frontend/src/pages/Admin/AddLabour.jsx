import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import PageContainer from "../../components/PageContainer";

const AddLabour = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "labour", // always labour by default
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/labours/add",
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Labour added successfully!");
        setFormData({ fullName: "", email: "", password: "", role: "labour" });
      } else {
        toast.error(res.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("❌ Add Labour Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to add labour. Try again!"
      );
    } finally {
      setLoading(false);
    }
  };
  //   if (loading) {
  //   return <Preloader />; // ✅ Replaced old loading spinner
  // }


  return (
    <PageContainer>
      <div className="flex items-center justify-center">
        <div className="max-w-lg w-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8">
          <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
            Add Labour
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-black font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                placeholder="Enter full name"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-black placeholder-black/50 bg-white/40 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-black font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter email"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-black placeholder-black/50 bg-white/40 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-black font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Enter password"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-black placeholder-black/50 bg-white/40 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`${loading
                ? "backdrop-blur-xl bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg font-bold transition duration-300 shadow-md"
                : "backdrop-blur-xl bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg font-bold transition duration-300 shadow-md hover:bg-blue-800"
                }`}
            >
              {loading ? "Adding..." : "Add Labour"}
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default AddLabour;
