import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaShoppingCart,
  FaBoxOpen,
  FaClipboardList,
  FaChartLine,
  FaBan,
} from "react-icons/fa";
import axios from "axios";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";
import Footer from "./Footer";
import API_BASE from "../../config";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    cartItems: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const cartState = useSelector((state) => state.handleCart);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const token = storedUser?.token;

        if (!token) {
          console.warn("No token found. Please login.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE}/api/v1/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = response.data.orders || [];

        const totalOrders = ordersData.length;
        const pendingOrders = ordersData.filter(
          (order) =>
            order.currentStatus?.status !== "Delivered" &&
            order.currentStatus?.status !== "Cancelled"
        ).length;

        const cancelledOrders = ordersData.filter(
          (order) => order.currentStatus?.status === "Cancelled"
        ).length;

        const totalSpent = ordersData.reduce(
          (acc, order) => acc + (order.total || 0),
          0
        );

        setStats({
          totalOrders,
          pendingOrders,
          cancelledOrders,
          totalSpent,
          cartItems: cartState?.length || 0,
        });

        const sortedOrders = ordersData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);

        setRecentOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          totalSpent: 0,
          cartItems: cartState?.length || 0,
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [cartState]);

  // StatCard Component (Glass UI)
  const StatCard = ({ icon, title, value, link, borderColor, iconColor, hoverBorderColor, hoverIconColor, shadowColor }) => (
    <Link
      to={link}
      className={`group backdrop-blur-xl bg-white/10 border ${borderColor} ${shadowColor} shadow-lg rounded-2xl p-6 
      hover:scale-105 hover:bg-white/20 hover:${hoverBorderColor} transition-all duration-500 ease-in-out cursor-pointer glass-card relative overflow-hidden`}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-500"></div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-black text-sm font-semibold tracking-wider uppercase">{title}</p>
          <p className="text-3xl font-extrabold text-black drop-shadow-md mt-2 group-hover:translate-x-1 transition-transform duration-300">
            {value}
          </p>
        </div>
        <div className={`text-5xl ${iconColor} group-hover:${hoverIconColor} group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 drop-shadow-lg`}>
          {icon}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return <Preloader />;
  }

  return (
    <PageContainer>
      <div className="space-y-8 animate-fadeIn bg-cover bg-center min-h-screen p-4"
      //  style={{ backgroundImage: "url('/assets/bg.jpg')" }}
      >

        {/* Header Section */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 
                        text-black rounded-2xl p-6 shadow-2xl">
          <h1 className="text-4xl font-bold drop-shadow">Welcome to Dashboard ✨</h1>
          <p className="text-black mt-1">
            Track your orders, cart and total spending all in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            icon={<FaClipboardList />}
            title="Total Orders"
            value={stats.totalOrders}
            link="/buyer-dashboard/orders"
            borderColor="border-blue-400/30"
            iconColor="text-blue-200"
            hoverBorderColor="border-blue-400"
            hoverIconColor="text-blue-400"
            shadowColor="shadow-blue-500/10"
          />
          <StatCard
            icon={<FaBoxOpen />}
            title="Pending Orders"
            value={stats.pendingOrders}
            link="/buyer-dashboard/orders"
            borderColor="border-yellow-400/30"
            iconColor="text-yellow-200"
            hoverBorderColor="border-yellow-400"
            hoverIconColor="text-yellow-400"
            shadowColor="shadow-yellow-500/10"
          />
          <StatCard
            icon={<FaBan />}
            title="Cancelled"
            value={stats.cancelledOrders}
            link="/buyer-dashboard/orders"
            borderColor="border-red-400/30"
            iconColor="text-red-200"
            hoverBorderColor="border-red-400"
            hoverIconColor="text-red-400"
            shadowColor="shadow-red-500/10"
          />
          <StatCard
            icon={<FaShoppingCart />}
            title="Cart Items"
            value={stats.cartItems}
            link="/buyer-dashboard/cart"
            borderColor="border-emerald-400/30"
            iconColor="text-emerald-200"
            hoverBorderColor="border-emerald-400"
            hoverIconColor="text-emerald-400"
            shadowColor="shadow-emerald-500/10"
          />
          <StatCard
            icon={<FaChartLine />}
            title="Total Spent"
            value={`₹${stats.totalSpent}`}
            link="/buyer-dashboard/orders"
            borderColor="border-purple-400/30"
            iconColor="text-purple-200"
            hoverBorderColor="border-purple-400"
            hoverIconColor="text-purple-400"
            shadowColor="shadow-purple-500/10"
          />
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-black">
          <h2 className="text-2xl font-bold mb-4">Quick Actions ⚡</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/buyer-dashboard/products"
              className="glass-btn bg-green-500/60 hover:bg-green-500 text-white p-4 rounded-2xl flex justify-center items-center space-x-3 transition-all"
            >
              <FaBoxOpen className="text-xl" />
              <span className="font-semibold">Browse Products</span>
            </Link>

            <Link
              to="/buyer-dashboard/cart"
              className="glass-btn bg-blue-500/60 hover:bg-blue-500 text-white p-4 rounded-2xl flex justify-center items-center space-x-3 transition-all relative"
            >
              <FaShoppingCart className="text-xl" />
              <span className="font-semibold">View Cart</span>

              {stats.cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                  {stats.cartItems}
                </span>
              )}
            </Link>

            <Link
              to="/buyer-dashboard/orders"
              className="glass-btn bg-orange-500/60 hover:bg-orange-500 text-white p-4 rounded-2xl flex justify-center items-center space-x-3 transition-all"
            >
              <FaClipboardList className="text-xl" />
              <span className="font-semibold">All Orders</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Orders 📦</h2>
            <Link to="/buyer-dashboard/orders" className="text-black hover:text-blue-800 font-semibold">
              View All →
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-black text-lg group-hover:text-blue-600 transition-colors">
                        #{order._id.slice(-6)}
                      </p>
                      <p className="text-black text-xs mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${order.currentStatus?.status === "Delivered"
                        ? "bg-green-100/10 text-green-900 border-green-900"
                        : order.currentStatus?.status === "Cancelled"
                          ? "bg-red-100/10 text-red-900 border-red-900"
                          : "bg-yellow-100/10 text-yellow-900 border-yellow-900"
                        }`}
                    >
                      {order.currentStatus?.status || "Pending"}
                    </span>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-3">
                    <div className="flex items-center text-black text-sm">
                      <span className="mr-1">📦</span>
                      {order.products?.reduce(
                        (acc, p) => acc + (p.qty || 0),
                        0
                      )} Items
                    </div>
                    <p className="font-bold text-black text-xl">₹{order.total || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-6xl mb-4">🛒</p>
              <h3 className="text-xl font-semibold text-black">
                No Recent Orders
              </h3>
              <p className="text-black mb-4">
                Start shopping to see your orders here.
              </p>
              <Link
                to="/buyer-dashboard/products"
                className="glass-btn bg-green-500/60 px-6 py-3 rounded-xl text-white hover:bg-green-500"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </PageContainer>
  );
};

export default DashboardOverview;
