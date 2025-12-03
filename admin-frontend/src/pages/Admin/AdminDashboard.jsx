// admin-frontend/src/pages/Admin/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxes,
  FaUserCog,
  FaChartBar,
  FaWarehouse,
  FaShoppingCart,
  FaUsers,
  FaUserTag,
  FaUserFriends,
} from "react-icons/fa";
import toast from "react-hot-toast";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";

// 👉 ALWAYS USE SHARED AXIOS INSTANCE
import api from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingSellers: 0,
    totalRevenue: 0,
    inventoryItems: 0,
    totalOrders: 0,
    activeBuyers: 0,
    activeSellers: 0,
    totalActiveUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // ============================
        // 1️⃣ PRODUCTS
        // ============================
        const productRes = await api.get("/api/v1/products/all", {
          withCredentials: true,
        });

        const products = productRes.data.products || [];
        const totalProducts = products.length;
        const pendingSellers = products.filter(
          (p) => p.status === "pending"
        ).length;

        const inventoryItems = products.reduce(
          (acc, p) => acc + (p.quantity || 0),
          0
        );

        const totalRevenue = products.reduce(
          (acc, p) => acc + (p.sold || 0) * (p.price || 0),
          0
        );

        // ============================
        // 2️⃣ ORDERS (Admin Endpoint)
        // ============================
        const ordersRes = await api.get("/api/v1/orders/admin/all", {
          withCredentials: true,
        });

        const deliveredOrders =
          ordersRes.data.orders?.filter(
            (o) => o.currentStatus?.status === "Delivered"
          ).length || 0;

        // ============================
        // 3️⃣ USERS
        // ============================
        const usersRes = await api.get("/api/users/", {
          withCredentials: true,
        });

        const users = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || [];

        const buyers = users.filter((u) => u.role === "buyer");
        const sellers = users.filter((u) => u.role === "seller");

        // ============================
        // SET FINAL DASHBOARD STATS
        // ============================
        setStats({
          totalProducts,
          pendingSellers,
          totalRevenue,
          inventoryItems,
          totalOrders: deliveredOrders,
          activeBuyers: buyers.length,
          activeSellers: sellers.length,
          totalActiveUsers: buyers.length + sellers.length,
        });
      } catch (err) {
        console.error("❌ Dashboard Error:", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <Preloader />;

  const dashboardCards = [
    {
      title: "Total Active Users",
      count: stats.totalActiveUsers,
      icon: FaUserFriends,
      link: "/admin-dashboard/users",
      description: "All active users (excluding admins)",
      color: "text-blue-900",
    },
    {
      title: "Products",
      count: stats.totalProducts,
      icon: FaBoxes,
      link: "/admin-dashboard/products",
      description: "Total products listed",
      color: "text-yellow-900",
    },
    {
      title: "Pending Seller Requests",
      count: stats.pendingSellers,
      icon: FaUserCog,
      link: "/admin-dashboard/seller-requests",
      description: "Sellers awaiting approval",
      color: "text-red-900",
    },
    {
      title: "Revenue",
      count: `₹${stats.totalRevenue}`,
      icon: FaChartBar,
      link: "/admin-dashboard/analytics",
      description: "Total revenue",
      color: "text-green-900",
    },
    {
      title: "Inventory",
      count: stats.inventoryItems,
      icon: FaWarehouse,
      link: "/admin-dashboard/inventory",
      description: "Available stock",
      color: "text-purple-900",
    },
    {
      title: "Delivered Orders",
      count: stats.totalOrders,
      icon: FaShoppingCart,
      link: "/admin-dashboard/orders",
      description: "Delivered orders count",
      color: "text-orange-900",
    },
    {
      title: "Active Buyers",
      count: stats.activeBuyers,
      icon: FaUsers,
      link: "/admin-dashboard/users/buyers",
      description: "Total registered buyers",
      color: "text-cyan-900",
    },
    {
      title: "Active Sellers",
      count: stats.activeSellers,
      icon: FaUserTag,
      link: "/admin-dashboard/users/sellers",
      description: "Total registered sellers",
      color: "text-indigo-900",
    },
  ];

  return (
    <PageContainer>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white">
            Admin Dashboard
          </h1>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboardCards.map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className={`group relative p-6 rounded-2xl shadow-md backdrop-blur-xl bg-white/10 border border-white/20
                transition duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:scale-[1.03]`}
              >
                <div className="relative flex items-start justify-between z-10">
                  <div>
                    <h2 className="text-lg font-bold text-white">{card.title}</h2>
                    <p className="mt-2 text-3xl font-extrabold text-white">
                      {card.count}
                    </p>
                    <p className="mt-2 text-sm text-white font-medium">
                      {card.description}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/20">
                    <card.icon
                      className={`text-3xl ${card.color} transition-transform duration-300 group-hover:rotate-12`}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;
