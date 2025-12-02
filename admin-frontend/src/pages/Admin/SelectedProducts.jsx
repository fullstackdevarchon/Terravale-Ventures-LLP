import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  Power,
  PowerOff,
} from "lucide-react";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";

const SelectedProducts = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingLimits, setEditingLimits] = useState({});
  const [showPreloader, setShowPreloader] = useState(true);

  /* =====================================================
     ✅ Initial Preloader (2 seconds)
  ===================================================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2000); // show preloader for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  /* =====================================================
     ✅ Fetch Categories
  ===================================================== */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/categories/all",
        { withCredentials: true }
      );

      if (data?.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        toast.error("⚠️ Invalid response from server.");
      }
    } catch (error) {
      toast.error("❌ Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* =====================================================
     ✅ Toggle Category (Enable/Disable)
  ===================================================== */
  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(
        `http://localhost:5000/api/v1/categories/${id}/toggle`,
        {},
        { withCredentials: true }
      );

      if (data?.success && data.category) {
        setCategories((prev) =>
          prev.map((c) => (c._id === id ? data.category : c))
        );
        toast.success(`🎉 ${data.message}`);
      } else {
        toast.error("❌ Toggle failed. Invalid response.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to toggle category";
      toast.error("⚠️ " + msg);
      console.error("Toggle Error:", error.response?.data || error.message);
    }
  };

  /* =====================================================
     ✅ Handle Limit Input (local edit)
  ===================================================== */
  const handleLimitChange = (id, value) => {
    setEditingLimits((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  /* =====================================================
     ✅ Save Limit Update
  ===================================================== */
  const handleSaveLimit = async (id) => {
    try {
      const newLimit = Number(editingLimits[id]);
      if (!newLimit || newLimit < 1) {
        toast.error("⚠️ Limit must be at least 1");
        return;
      }

      const { data } = await axios.patch(
        `http://localhost:5000/api/v1/categories/${id}/limit`,
        { limit: newLimit },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data?.success && data.category) {
        setCategories((prev) =>
          prev.map((c) => (c._id === id ? data.category : c))
        );
        toast.success(`✅ ${data.message}`);

        // Clear editing state
        setEditingLimits((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      } else {
        toast.error("❌ Update failed: Invalid response");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Error updating limit";
      toast.error("⚠️ " + msg);
    }
  };

  /* =====================================================
     ✅ Show Preloader before main UI
  ===================================================== */
  // if (showPreloader) {
  //   return <Preloader />;
  // }

  /* =====================================================
     ✅ UI Layout
  ===================================================== */
  return (
    <PageContainer>
      <div className="p-6">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#333",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              padding: "12px 18px",
              fontWeight: 500,
            },
          }}
        />

        <div className="max-w-7xl mx-auto">
          <motion.h1
            className="text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Category Management
          </motion.h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin w-12 h-12 text-black" />
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {categories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-5 hover:scale-[1.02] transition duration-300 relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-black">
                          {category.name}
                        </h3>
                        <p
                          className={`text-sm mt-1 font-bold ${category.enabled
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          {category.enabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-white/30 p-2 rounded-full backdrop-blur-sm">
                        {category.enabled ? (
                          <CheckCircle className="text-green-600 w-5 h-5" />
                        ) : (
                          <XCircle className="text-red-600 w-5 h-5" />
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-sm text-black/80 font-medium space-y-2 mb-4 bg-white/20 p-3 rounded-xl border border-white/10">
                      <p>Group: <span className="font-bold text-black">{category.group || "Not assigned"}</span></p>
                      <p>Limit: <span className="font-bold text-black">{category.limit}</span></p>
                    </div>

                    {/* Limit Input */}
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="number"
                        min="1"
                        value={editingLimits[category._id] ?? category.limit}
                        onChange={(e) =>
                          handleLimitChange(category._id, e.target.value)
                        }
                        className="w-24 px-3 py-2 border border-white/30 bg-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-black font-bold text-center"
                      />
                      {editingLimits[category._id] !== undefined && (
                        <button
                          onClick={() => handleSaveLimit(category._id)}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-white hover:bg-[#0000cc] transition-all font-bold shadow-md"
                        >
                          <Save size={16} /> Save
                        </button>
                      )}
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggle(category._id)}
                      className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 ${category.enabled
                        ? "bg-red-600 hover:bg-red-900"
                        : "bg-green-600 hover:bg-green-900"
                        }`}
                    >
                      {category.enabled ? (
                        <>
                          <PowerOff size={18} /> Disable
                        </>
                      ) : (
                        <>
                          <Power size={18} /> Enable
                        </>
                      )}
                    </button>

                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default SelectedProducts;
