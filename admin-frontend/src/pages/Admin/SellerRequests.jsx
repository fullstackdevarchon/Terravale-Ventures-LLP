// src/pages/Admin/SellerRequests.jsx
import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaPepperHot,
  FaAppleAlt,
  FaLeaf,
  FaBox,
  FaUser,
  FaTag,
  FaWeightHanging,
} from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
// import { sendNotification } from "../../socket"; // Socket removed
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";

const SellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [rejectOptions, setRejectOptions] = useState({});
  const [showPreloader, setShowPreloader] = useState(true);
  const [customRejectModal, setCustomRejectModal] = useState({
    isOpen: false,
    requestId: null,
    reason: "",
  });

  // ✅ Show Preloader for 2 seconds initially
  useEffect(() => {
    const timer = setTimeout(() => setShowPreloader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Fetch product requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/products/all",
        { withCredentials: true }
      );
      if (data.success) {
        setRequests(data.products);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch categories (only enabled)
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/categories/all",
        { withCredentials: true }
      );
      if (data.success) {
        const enabled = data.categories.filter((cat) => cat.enabled);
        setCategories(enabled);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching categories");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCategories();
  }, []);

  // ✅ Count approved per category
  const getApprovedCount = (catName) => {
    return requests.filter(
      (req) =>
        req.status === "approved" &&
        req.category?.name?.toLowerCase() === catName?.toLowerCase()
    ).length;
  };

  // ✅ Update product status
  const updateStatus = async (id, newStatus, rejectionReason = "") => {
    const product = requests.find((r) => r._id === id);
    const category = categories.find(
      (c) => c.name.toLowerCase() === product?.category?.name?.toLowerCase()
    );

    // Limit check before approving
    if (newStatus.toLowerCase() === "approved" && category) {
      const approvedCount = getApprovedCount(category.name);
      if (approvedCount >= category.limit) {
        toast.error(
          `Limit reached for ${category.name} (Limit: ${category.limit})`
        );
        return;
      }
    }

    try {
      const { data } = await axios.patch(
        `http://localhost:5000/api/v1/products/${id}/status`,
        { status: newStatus.toLowerCase(), rejectionReason },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(`✅ Product ${newStatus}`);
        setRequests((prev) =>
          prev.map((req) =>
            req._id === id
              ? { ...req, status: newStatus.toLowerCase(), rejectionReason }
              : req
          )
        );
        setRejectOptions((prev) => ({ ...prev, [id]: false }));

        // ✅ Send notification to seller
        if (product.seller?._id) {
          // sendNotification({
          //   role: product.seller._id,
          //   title: `Product ${newStatus}`,
          //   message: `Your product "${product.name}" has been ${newStatus}${
          //     rejectionReason ? `: ${rejectionReason}` : ""
          //   }.`,
          // });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  // ✅ Apply category & status filters
  const filteredRequests = requests.filter((req) => {
    const categoryMatch =
      categoryFilter === "All" ||
      req.category?.name?.toLowerCase() === categoryFilter.toLowerCase();

    const statusMatch = req.status === statusFilter.toLowerCase();
    return categoryMatch && statusMatch;
  });

  // ✅ Category icons
  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case "spices":
        return <FaPepperHot className="text-red-500" />;
      case "fruits":
        return <FaAppleAlt className="text-green-500" />;
      case "vegetables":
        return <FaLeaf className="text-emerald-600" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const rejectionReasons = [
    "Picture not quality",
    "Price is too high",
    "Invalid product details",
    "Duplicate listing",
    "Other issues",
  ];

  // // ✅ Show Preloader first
  // if (showPreloader) {
  //   return <Preloader />;
  // }

  return (
    <PageContainer>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
            Seller Product Requests
          </h2>

          <div className="flex gap-3">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/40 border border-white/30 text-black shadow-md focus:ring-2 focus:ring-[#0000e6] focus:outline-none backdrop-blur-sm font-medium"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/40 border border-white/30 text-black shadow-md focus:ring-2 focus:ring-[#0000e6] focus:outline-none backdrop-blur-sm font-medium"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Category Limit Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const approvedCount = getApprovedCount(cat.name);
            return (
              <div
                key={cat._id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg flex flex-col items-center text-center hover:scale-[1.02] transition"
              >
                <div className="text-2xl mb-2 bg-white/20 p-3 rounded-full">{getCategoryIcon(cat.name)}</div>
                <h3 className="font-bold text-black text-lg">{cat.name}</h3>
                <p className="text-sm text-black/70 font-medium">
                  Limit: <span className="font-bold text-black">{cat.limit}</span>
                </p>
                <p className="text-sm text-black/70 font-medium">
                  Approved:{" "}
                  <span
                    className={`font-bold ${approvedCount >= cat.limit
                      ? "text-red-600"
                      : "text-green-600"
                      }`}
                  >
                    {approvedCount}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        {loading ? (
          <p className="text-center text-black font-medium">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((req) => {
                const category = categories.find(
                  (c) =>
                    c.name.toLowerCase() === req.category?.name?.toLowerCase()
                );
                const approvedCount = category
                  ? getApprovedCount(category.name)
                  : 0;

                return (
                  <div
                    key={req._id}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl hover:scale-[1.02] transition duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Full Width Image */}
                    <div className="relative h-48 w-full bg-gray-200">
                      <img
                        src={req.image?.url || "/placeholder.png"}
                        alt={req.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                        {getCategoryIcon(req.category?.name)}
                      </div>
                    </div>

                    {/* Content Wrapper */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-black">
                          {req.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-row gap-1">
                          <span className="text-xm text-black font-bold flex items-center gap-1">
                            <FaUser className="text-blue-900" /> Seller :
                          </span>
                          <span className="text-xm font-bold text-black">
                            {req.seller?.fullName || "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-row gap-1">
                          <span className="text-xm text-black font-bold flex items-center gap-1">
                            <FaTag className="text-green-900" />  Price :
                          </span>
                          <span className="text-xm font-bold text-[#0000e6]">
                            ₹{req.price}
                          </span>
                        </div>
                        <div className="flex flex-row gap-1">
                          <span className="text-xm text-black font-bold flex items-center gap-1">
                            <FaWeightHanging className="text-orange-900" /> Weight :
                          </span>
                          <span className="text-xm font-bold text-black">
                            {req.weight}
                          </span>
                        </div>
                        <div className="flex flex-row gap-1">
                          <span className="text-xm text-black font-bold flex items-center gap-1">
                            <FaBox className="text-purple-900" /> Quantity :
                          </span>
                          <span className="text-xm font-bold text-black">
                            {req.quantity}
                          </span>
                        </div>
                      </div>

                      {category && (
                        <div className="text-xs mt-2 text-black/60 bg-white/20 p-2 rounded-lg mb-3 font-medium text-center border border-white/10">
                          Category Limit: <span className="font-bold text-black">{category.limit}</span> | Approved: <span className={`font-bold ${approvedCount >= category.limit ? "text-red-600" : "text-green-600"}`}>{approvedCount}</span>
                        </div>
                      )}

                      <div className="flex justify-center mb-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : req.status === "approved"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* Approve/Reject Buttons */}
                      {req.status === "pending" && (
                        <div className="mt-auto space-y-3">
                          <button
                            onClick={() => updateStatus(req._id, "Approved")}
                            className="w-full bg-[#0000e6] hover:bg-blue-800 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition transform active:scale-95"
                            disabled={
                              category &&
                              getApprovedCount(category.name) >= category.limit
                            }
                          >
                            <FaCheck /> Approve
                          </button>

                          {!rejectOptions[req._id] ? (
                            <button
                              onClick={() =>
                                setRejectOptions((prev) => ({
                                  ...prev,
                                  [req._id]: true,
                                }))
                              }
                              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md transition transform active:scale-95"
                            >
                              <FaTimes /> Reject
                            </button>
                          ) : (
                            <div className="space-y-2 bg-white/30 p-3 rounded-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-black mb-1 text-center">Select Reason:</p>
                              {rejectionReasons.map((reason) => (
                                <button
                                  key={reason}
                                  onClick={() => {
                                    if (reason === "Other issues") {
                                      setCustomRejectModal({
                                        isOpen: true,
                                        requestId: req._id,
                                        reason: "",
                                      });
                                    } else {
                                      updateStatus(req._id, "Rejected", reason);
                                    }
                                  }}
                                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-1.5 px-2 rounded-lg text-xs font-bold transition"
                                >
                                  {reason}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {req.status === "rejected" && req.rejectionReason && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                          ❌ Reason: {req.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRequests.length === 0 && (
              <p className="text-center text-black/70 mt-10 text-lg font-medium bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                No requests found.
              </p>
            )}
          </>
        )}

        {/* Custom Rejection Reason Modal */}
        {customRejectModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
              <div className="bg-red-600 p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaTimes /> Reject Product
                </h3>
                <button
                  onClick={() =>
                    setCustomRejectModal({
                      isOpen: false,
                      requestId: null,
                      reason: "",
                    })
                  }
                  className="text-white/80 hover:text-white transition"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700 font-medium">
                  Please specify the reason for rejection:
                </p>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-none text-black"
                  rows="4"
                  placeholder="Type reason here..."
                  value={customRejectModal.reason}
                  onChange={(e) =>
                    setCustomRejectModal((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                ></textarea>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() =>
                      setCustomRejectModal({
                        isOpen: false,
                        requestId: null,
                        reason: "",
                      })
                    }
                    className="px-4 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!customRejectModal.reason.trim()) {
                        toast.error("Please enter a reason");
                        return;
                      }
                      updateStatus(
                        customRejectModal.requestId,
                        "Rejected",
                        customRejectModal.reason
                      );
                      setCustomRejectModal({
                        isOpen: false,
                        requestId: null,
                        reason: "",
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-md"
                  >
                    Submit Rejection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer >
  );
};

export default SellerRequests;
