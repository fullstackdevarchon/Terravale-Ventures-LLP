// src/pages/Seller/CheckStatus.jsx
import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBalanceScale,
  FaBoxes,
  FaTrash,
  FaRupeeSign,
  FaTag,
  FaListAlt,
  FaUserShield,
} from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

function CheckStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch seller products
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/products/seller",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setOrders(data.products);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      toast.error("Failed to fetch order status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Delete pending product
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/v1/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("❌ Product delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  // Status Badge with glass style
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="flex items-center gap-2 text-yellow-700 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md">
            <FaClock /> Pending
          </span>
        );
      case "approved":
      case "accepted":
        return (
          <span className="flex items-center gap-2 text-green-700 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md">
            <FaCheckCircle /> Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-2 text-red-700 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md">
            <FaTimesCircle /> Rejected
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <PageContainer>
      <div className="p-6 max-w-7xl mx-auto text-black">
        <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          Product Approval Status
        </h2>

        {loading ? (
          <p className="text-center text-black/70">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-black/60 text-center">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {orders.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition overflow-hidden relative text-black"
              >
                {/* Product Image */}
                <div className="w-full h-52 bg-gray-300/20 overflow-hidden">
                  <img
                    src={product.image?.url || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x200?text=No+Image")
                    }
                  />
                </div>

                {/* Product Body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1 truncate flex items-center gap-2">
                    <FaTag className="text-blue-600" /> {product.name}
                  </h3>

                  <p className="text-sm text-black/70 mb-1 flex items-center gap-2">
                    <FaListAlt className="text-pink-600" /> {product.category?.name || "Uncategorized"}
                  </p>

                  <p className="text-xl font-bold text-[#0000e6] mb-3 flex items-center gap-2">
                    <FaRupeeSign className="text-yellow-700" /> {product.price}
                  </p>

                  {/* Weight & Quantity */}
                  <div className="flex items-center justify-between mb-3 text-sm text-black/80">
                    <span className="flex items-center gap-2">
                      <FaBalanceScale className="text-green-900" />
                      <span className="font-medium">Weight:</span>{" "}
                      {product.weight}
                    </span>

                    <span className="flex items-center gap-2">
                      <FaBoxes className="text-orange-600" />
                      <span className="font-medium">Qty:</span>{" "}
                      {product.quantity}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">{getStatusBadge(product.status)}</div>

                  {/* Admin Note */}
                  <p className="text-sm text-black/70 mb-3 flex items-start gap-2">
                    <FaUserShield className="text-purple-900 mt-1 min-w-[16px]" />
                    <span>
                      <span className="font-semibold text-black">Admin:</span>{" "}
                      {product.rejectionReason
                        ? product.rejectionReason
                        : product.status.toLowerCase() === "approved"
                          ? "Product verified successfully"
                          : "Awaiting admin review"}
                    </span>
                  </p>

                  {/* Delete (pending only) */}
                  {product.status.toLowerCase() === "pending" && (
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </PageContainer>
  );
}

export default CheckStatus;
