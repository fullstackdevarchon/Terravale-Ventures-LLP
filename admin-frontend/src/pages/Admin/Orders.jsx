// src/pages/Admin/Orders.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTruck,
  FaClipboardList,
  FaUser,
  FaSearch,
  FaFilter,
  FaBox,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendar,
} from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";
import API_BASE from "../../config";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showPreloader, setShowPreloader] = useState(true);

  // 🔥 Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/v1/orders/admin/all`,
          { withCredentials: true }
        );
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      } finally {
        setTimeout(() => setShowPreloader(false), 3000);
      }
    };

    fetchOrders();
  }, []);

  // 🔍 Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const customerName =
      order?.address?.fullName?.toLowerCase() || "unknown customer";
    const productsList = order?.products
      ?.map((p) => p?.product?.name || "unknown product")
      .join(", ")
      .toLowerCase();

    const matchesSearch =
      customerName.includes(search.toLowerCase()) ||
      productsList.includes(search.toLowerCase());

    const matchesFilter = filter === "All" ? true : order.status === filter;

    return matchesSearch && matchesFilter;
  });

  // 🎨 Status Color Mapping
  const statusClasses = {
    "Order Placed": "bg-yellow-100 text-yellow-800 border-yellow-300",
    Confirmed: "bg-indigo-100 text-indigo-800 border-indigo-300",
    Shipped: "bg-blue-100 text-blue-800 border-blue-300",
    Delivered: "bg-green-100 text-green-800 border-green-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  // 📊 Calculate Statistics
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter((o) =>
    ["Order Placed", "Confirmed", "Shipped"].includes(o.status)
  ).length;
  const cancelledOrders = filteredOrders.filter((o) => o.status === "Cancelled").length;

  return (
    <PageContainer>
      <div className="min-h-screen p-4 md:p-8">
        {/* Page Title */}
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          <FaClipboardList className="text-orange-500 text-3xl md:text-5xl" />
          <span>Order Management</span>
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-3 text-black z-10" />
            <input
              type="text"
              placeholder="Search customer or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/40 border border-white/30 text-black placeholder-black/50 shadow-sm focus:ring-2 focus:ring-white focus:outline-none backdrop-blur-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FaFilter className="text-blue-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 md:flex-none px-5 py-2 rounded-xl bg-white/40 border border-white/30 text-black shadow-md focus:ring-2 focus:ring-white focus:outline-none backdrop-blur-sm"
            >
              <option value="All">All Orders</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-black text-lg font-medium bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              No orders found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-white/20 to-white/10 p-2 border-b border-white/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <FaClipboardList className="text-orange-500 text-base" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                          <FaCalendar className="text-xs" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusClasses[order.status]
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-2 space-y-2">
                  {/* Customer Info */}
                  <div className="bg-white/40 backdrop-blur-md p-2 rounded-lg border border-white/20">
                    <div className="flex items-start gap-2">
                      <FaUser className="text-blue-500 text-sm mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black text-sm">
                          {order?.address?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-black/70 font-medium truncate">
                          {order?.address?.email || "No email"}
                        </p>
                        <div className="flex items-start gap-1 mt-1 text-xs text-black/70">
                          <FaPhone className="mt-0.5 flex-shrink-0 text-xs" />
                          <span>{order?.address?.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-start gap-1 mt-0.5 text-xs text-black/70">
                          <FaMapMarkerAlt className="mt-0.5 flex-shrink-0 text-xs" />
                          <span className="line-clamp-1">
                            {order?.address?.street}, {order?.address?.city}, {order?.address?.state} - {order?.address?.pincode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="bg-white/40 backdrop-blur-md p-2 rounded-lg border border-white/20">
                    <div className="flex items-center gap-1 mb-1">
                      <FaBox className="text-indigo-500 text-sm" />
                      <span className="font-semibold text-black text-xs">Products</span>
                    </div>
                    <div className="space-y-1">
                      {order?.products?.map((p, idx) => (
                        <div
                          key={p.product?._id || idx}
                          className="flex justify-between items-center bg-white/30 p-1.5 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black text-xs truncate">
                              {p.product?.name || "Unknown Product"}
                            </p>
                            <p className="text-xs text-black/60">
                              Qty: {p.qty} × ₹{p.product?.price || 0}
                            </p>
                          </div>
                          <p className="font-semibold text-black text-xs ml-1">
                            ₹{(p.qty * (p.product?.price || 0)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md p-2 rounded-lg border border-white/30">
                    <div className="flex justify-between items-center">
                      <span className="text-black font-semibold text-sm">Total:</span>
                      <span className="text-lg font-bold text-white drop-shadow-lg">
                        ₹{order.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Summary */}
        <div className="mt-8 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Orders */}
            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center">
              <p className="text-sm text-black/70 font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-extrabold text-black">{totalOrders}</p>
            </div>

            {/* Pending Orders (Order Placed + Confirmed + Shipped) */}
            <div className="bg-yellow-100/50 backdrop-blur-sm p-4 rounded-xl border border-yellow-300/50 text-center">
              <p className="text-sm text-yellow-800 font-medium mb-1">Pending</p>
              <p className="text-3xl font-extrabold text-yellow-800">{pendingOrders}</p>
              <p className="text-xs text-yellow-700 mt-1">Order Placed + Confirmed + Shipped</p>
            </div>

            {/* Cancelled Orders */}
            <div className="bg-red-100/50 backdrop-blur-sm p-4 rounded-xl border border-red-300/50 text-center">
              <p className="text-sm text-red-800 font-medium mb-1">Cancelled</p>
              <p className="text-3xl font-extrabold text-red-800">{cancelledOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Orders;
