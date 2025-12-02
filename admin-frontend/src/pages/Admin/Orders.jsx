// src/pages/Admin/Orders.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTruck,
  FaClipboardList,
  FaUser,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showPreloader, setShowPreloader] = useState(true); // 👈 start with preloader visible

  // 🔥 Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/orders/admin/all",
          { withCredentials: true }
        );
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      } finally {
        // ⏳ Show preloader for 3 seconds before fade
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
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Confirmed: "bg-indigo-100 text-indigo-800 border-indigo-300",
    Shipped: "bg-blue-100 text-blue-800 border-blue-300",
    Delivered: "bg-green-100 text-green-800 border-green-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  // // ⏳ Show Preloader
  // if (showPreloader) {
  //   return <Preloader />;
  // }

  return (
    <PageContainer>
      <div className="min-h-screen p-8">
        {/* Page Title */}
        <h2 className="text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl flex items-center justify-center gap-3">
          <FaClipboardList className="text-orange-500" />
          Order Management
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
          <div className="flex items-center gap-2">
            <FaFilter className="text-blue-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-5 py-2 rounded-xl bg-white/40 border border-white/30 text-black shadow-md focus:ring-2 focus:ring-white focus:outline-none backdrop-blur-sm"
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

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-black text-lg font-medium bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              No orders found.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition duration-300"
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black">
                      Order #{order._id.slice(-6)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${statusClasses[order.status]
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md p-3 rounded-lg border border-white/20 group">
                    <FaUser className="text-blue-500 transition-transform duration-300 group-hover:rotate-12" />
                    <div>
                      <p className="font-bold text-black">
                        {order?.address?.fullName || "Unknown"}
                      </p>
                      <p className="text-sm text-black/70 font-medium">
                        {order?.address?.email || "No email"}
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="bg-white/40 backdrop-blur-md p-3 rounded-lg border border-white/20 group">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTruck className="text-indigo-500 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="font-bold text-black">Products</span>
                    </div>
                    <div className="text-sm text-black/80 font-medium">
                      {order?.products?.map((p) => (
                        <div key={p.product?._id} className="mb-1">
                          {p.product?.name} (x{p.qty})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-black/10">
                    <span className="text-black font-medium">Total Amount:</span>
                    <span className="text-lg font-extrabold text-white">
                      ₹{order.total}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Summary */}
        <div className="mt-8 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/30">
          <div className="flex justify-between items-center">
            <span className="text-black font-bold">
              Total Orders: {filteredOrders.length}
            </span>
            <span className="text-black font-bold">
              Pending / Cancelled:{" "}
              {
                filteredOrders.filter((o) =>
                  ["Pending", "Cancelled"].includes(o.status)
                ).length
              }
            </span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Orders;
