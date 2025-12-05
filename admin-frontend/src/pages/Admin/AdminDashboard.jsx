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
import api from "../../api/axios"; // shared axios instance

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingSellers: 0,
    totalRevenue: 0,
    inventoryItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeBuyers: 0,
    activeSellers: 0,
    totalActiveUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {

        // ----------- PRODUCTS -----------
        const productRes = await api.get("/api/v1/products/all");
        const products = productRes.data.products || [];

        const totalProducts = products.length;
        const pendingSellers = products.filter(p => p.status === "pending").length;
        const inventoryItems = products.reduce((a, p) => a + (p.quantity || 0), 0);
        const totalRevenue = products.reduce(
          (a, p) => a + (p.sold || 0) * (p.price || 0),
          0
        );

        // ----------- ORDERS -----------
        const ordersRes = await api.get("/api/v1/orders/admin/all");
        const allOrders = ordersRes.data.orders || [];
        const deliveredOrders = allOrders.filter(
          o => o.status === "Delivered"
        ).length;
        const pendingOrders = allOrders.filter(
          o => o.status === "Order Placed"
        ).length;

        // ----------- USERS -----------
        const usersRes = await api.get("/api/users/");
        const users = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || [];

        const buyers = users.filter(u => u.role === "buyer");
        const sellers = users.filter(u => u.role === "seller");

        setStats({
          totalProducts,
          pendingSellers,
          totalRevenue,
          inventoryItems,
          totalOrders: deliveredOrders,
          pendingOrders,
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
      title: "Pending Orders",
      count: stats.pendingOrders,
      icon: FaShoppingCart,
      link: "/admin-dashboard/orders",
      description: "Orders with 'Order Placed' status",
      color: "text-yellow-900",
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
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
            Admin Dashboard
          </h1>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

            {dashboardCards.map((card, index) => {
              const Icon = card.icon; // 👈 FIX HERE

              return (
                <Link
                  key={index}
                  to={card.link}
                  className="group relative p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg backdrop-blur-xl bg-white/10 border border-white/20
                  transition duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:scale-[1.03]"
                >
                  <div className="relative flex items-start justify-between z-10">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base md:text-lg font-bold text-white truncate">{card.title}</h2>
                      <p className="mt-2 text-2xl md:text-3xl font-extrabold text-white">{card.count}</p>
                      <p className="mt-1 md:mt-2 text-xs md:text-sm text-white font-medium line-clamp-2">{card.description}</p>
                    </div>

                    <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/20 flex-shrink-0 ml-2">
                      <Icon
                        className={`text-2xl md:text-3xl ${card.color} transition-transform duration-300 group-hover:rotate-12`}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}

          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;