import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaPlusCircle,
  FaBoxOpen,
  FaClipboardCheck,
  FaChartLine,
} from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";
import Footer from "./Footer";

// Socket removed

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
    revenue: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch Stats
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/v1/products/seller", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return toast.error("Failed to load dashboard data");

      const data = await res.json();
      const products = data.products || [];

      let totalSold = 0;
      let revenue = 0;

      products.forEach((p) => {
        totalSold += p.sold || 0;
        revenue += (p.sold || 0) * (p.price || 0);
      });

      setStats({
        totalProducts: products.length,
        pendingOrders: 5,
        totalSales: totalSold,
        revenue,
      });

      setRecentProducts(products.slice(0, 3));
    } catch (err) {
      toast.error("Error fetching dashboard data");
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  // Stat Card
  const StatCard = ({ icon, title, value, color, link }) => (
    <Link
      to={link}
      className="
        group
        backdrop-blur-xl bg-white/10 border border-white/20 
        text-black rounded-2xl p-6 shadow-2xl transition-all
        hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_25px_rgba(0,0,0,0.1)]
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black/70 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`text-4xl ${color} transition-transform duration-300 group-hover:rotate-12`}>
          {icon}
        </div>
      </div>
    </Link>
  );

  if (loading) return <Preloader />;

  return (
    <PageContainer>
      <div
        className="
          min-h-screen p-6 
          bg-fixed bg-cover bg-center 
        "
      // style={{
      //   backgroundImage: "url('/assets/IMG-20251013-WA0000.jpg')",
      // }}
      >
        <div className="space-y-10">

          {/* WELCOME SECTION */}
          <div
            className="
              backdrop-blur-xl bg-white/10 border border-white/20
              text-black rounded-2xl p-10 shadow-2xl
              hover:bg-white/10 transition-all hover:shadow-[0_0_25px_rgba(0,0,0,0.1)]
            "
          >
            <h1 className="text-4xl font-extrabold mb-2">
              Welcome to Your Dashboard! 🌾
            </h1>
            <p className="text-black text-lg">
              Manage your products and track your sales performance.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-black font-bold text-lg">
            <StatCard
              icon={<FaBoxOpen />}
              title="Total Products"
              value={stats.totalProducts}
              color="text-blue-900"
              link="/seller/my-products"
            />

            <StatCard
              icon={<FaClipboardCheck />}
              title="Pending Orders"
              value={stats.pendingOrders}
              color="text-yellow-900"
              link="/seller/check-status"
            />

            <StatCard
              icon={<FaChartLine />}
              title="Total Sales"
              value={stats.totalSales}
              color="text-green-900"
              link="/seller/check-status"
            />

            <StatCard
              icon={<FaChartLine />}
              title="Revenue"
              value={`₹${stats.revenue}`}
              color="text-purple-900"
              link="/seller/check-status"
            />
          </div>

          {/* QUICK ACTIONS */}
          <div
            className="
              backdrop-blur-xl bg-white/10 border border-white/20 
              text-black rounded-2xl p-6 shadow-2xl
            "
          >
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <Link
                to="/seller/add-product"
                className="
                  group
                  flex items-center justify-center gap-3
                  border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold cursor-pointer p-4
                "
              >
                <FaPlusCircle className="text-xl text-blue-900 group-hover:rotate-90 transition-transform duration-300" /> Add New Product
              </Link>

              <Link
                to="/seller/my-products"
                className="
                  group
                  flex items-center justify-center gap-3
                  border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold cursor-pointer p-4
                "
              >
                <FaBoxOpen className="text-xl text-green-900 group-hover:rotate-12 transition-transform duration-300" /> View My Products
              </Link>

              <Link
                to="/seller/check-status"
                className="
                  group
                  flex items-center justify-center gap-3
                  border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold cursor-pointer p-4
                "
              >
                <FaClipboardCheck className="text-xl text-orange-900 group-hover:rotate-12 transition-transform duration-300" /> Check Status
              </Link>

            </div>
          </div>

          {/* RECENT PRODUCTS */}
          {recentProducts.length > 0 ? (
            <div
              className="
                backdrop-blur-xl bg-white/10 border border-white/20 
                text-black rounded-2xl p-6 shadow-2xl
              "
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Products</h2>

                <Link
                  to="/seller/my-products"
                  className="text-black hover:text-blue-800 font-semibold"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="
                      group
                      backdrop-blur-xl bg-white/10 border border-white/20
                      rounded-xl overflow-hidden shadow-xl
                      hover:scale-105 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]
                      transition-all
                    "
                  >
                    {/* IMAGE */}
                    <div className="h-40 bg-black/5 flex items-center justify-center overflow-hidden">
                      {product.image?.url ? (
                        <img
                          src={product.image.url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-black/40 text-4xl">📦</span>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="p-4">
                      <h3 className="font-semibold text-black truncate text-lg">
                        {product.name}
                      </h3>

                      <p className="text-gray-200 font-bold mt-1">
                        ₹{product.price}
                      </p>

                      <p className="text-black font-bold text-sm mt-1">
                        {product?.category?.name || "Uncategorized"}
                      </p>

                      {/* DESCRIPTION */}
                      <p className="text-black text-xs mt-2 line-clamp-2">
                        {product.description || "No description available for this product."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="
                backdrop-blur-xl bg-white/10 border border-white/20 
                text-black rounded-2xl p-10 shadow-xl text-center
              "
            >
              <div className="text-black/20 text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold mb-2">No Products Yet</h3>
              <p className="text-black/60 mb-6">
                Add your first product to get started.
              </p>

              <Link
                to="/seller/add-product"
                className="
                  inline-flex items-center
                  border border-white/40 text-black text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white transition shadow-md font-semibold cursor-pointer px-6 py-3
                "
              >
                <FaPlusCircle className="inline mr-2 text-orange-600" />
                Add Your First Product
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
