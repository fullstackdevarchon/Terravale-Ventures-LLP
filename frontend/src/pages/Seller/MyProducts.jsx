// src/pages/Seller/MyProducts.jsx
import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaTimes, FaRupeeSign, FaBalanceScale, FaBoxOpen, FaChartLine, FaAlignLeft } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState("");

  // Fetch seller products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/products/seller",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("❌ Product fetch error:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/v1/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("❌ Product delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  // Open edit modal
  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewStock(product.quantity);
  };

  // Update stock API
  const handleUpdateStock = async () => {
    if (!newStock || isNaN(newStock)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/v1/products/${editingProduct._id}`,
        { quantity: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Stock updated successfully!");
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProduct._id ? { ...p, quantity: newStock } : p
          )
        );
        setEditingProduct(null);
      } else {
        toast.error("Failed to update stock");
      }
    } catch (error) {
      console.error("❌ Stock update error:", error);
      toast.error("Failed to update stock");
    }
  };

  return (
    <PageContainer>
      <div className="p-6 max-w-7xl mx-auto text-black">
        <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl
">
          My Products
        </h2>

        {loading ? (
          <p className="text-center text-black/70">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-black/60 text-center">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition overflow-hidden group text-black"
              >
                {/* Image */}
                <div className="w-full h-48 bg-gray-200/30 overflow-hidden">
                  <img
                    src={
                      typeof product.image === "object"
                        ? product.image.url
                        : product.image
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x200?text=No+Image")
                    }
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-xl font-bold text-black mb-2 flex items-center gap-2">
                    <FaRupeeSign className="text-yellow-900" /> {product.price}
                  </p>

                  {product.description && (
                    <div className="flex items-start gap-2 mb-1">
                      <FaAlignLeft className="text-purple-900 mt-1 min-w-[16px] flex-shrink-0" />
                      <p className="text-black/70 text-sm line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {product.weight && (
                    <p className="text-black/80 text-sm mb-2 flex items-center gap-2">
                      <FaBalanceScale className="text-green-900" />
                      <strong>Weight:</strong> {product.weight}
                    </p>
                  )}

                  <div className="flex justify-between text-sm mb-4">
                    <span className="font-semibold text-black/80 flex items-center gap-2">
                      <FaBoxOpen className="text-blue-900" /> Stock: {product.quantity}
                    </span>
                    <span className="font-semibold text-black/80 flex items-center gap-2">
                      <FaChartLine className="text-orange-900" /> Sold: {product.sold || 0}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center justify-center gap-2 bg-[#0000e6] hover:bg-[#0000cc] text-white px-3 py-2 rounded-lg transition flex-1"
                    >
                      <FaEdit className="text-yellow-300" /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg shadow-lg transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Stock Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex justify-center items-center z-50">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/40 p-6 rounded-2xl shadow-2xl w-80 text-black">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Update Stock</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-black/60 hover:text-red-600"
                >
                  <FaTimes />
                </button>
              </div>

              <p className="text-black/80 mb-4 font-medium">{editingProduct.name}</p>

              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-black border border-gray-300 focus:ring-2 focus:ring-[#0000e6] outline-none mb-4"
                placeholder="Enter new quantity"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-200 transition text-black"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateStock}
                  className="px-4 py-2 rounded-lg bg-[#0000e6] hover:bg-[#0000cc] text-white transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </PageContainer>
  );
};

export default MyProducts;
