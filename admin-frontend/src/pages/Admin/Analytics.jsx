import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FaChartPie, FaBoxOpen } from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";
import API_BASE from "../../config";

const COLORS = ["#c7d22aff", "#0af0c6ff", "#eda60cff", "#FF8042", "#9410e6ff"];

const Analytics = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // Default: Last 30 days

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/v1/orders/admin/all`,
          { withCredentials: true }
        );

        if (data.success && data.orders) {
          // ✅ Calculate date threshold (last X days)
          const daysAgo = parseInt(dateRange);
          const dateThreshold = new Date();
          dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

          // ✅ Filter delivered orders from last X days
          const deliveredOrders = data.orders.filter((order) => {
            const isDelivered = order.status === "Delivered";
            const orderDate = new Date(order.createdAt || order.updatedAt);
            const isWithinRange = orderDate >= dateThreshold;
            return isDelivered && isWithinRange;
          });

          const categoryMap = {};
          const productMap = {};

          deliveredOrders.forEach((order) => {
            // ✅ Safety check: ensure products array exists
            if (!order.products || !Array.isArray(order.products)) return;

            order.products.forEach((item) => {
              // ✅ Priority: snapshot (v2.0) > old fields (v1.0) > populated product > fallback
              let productName, productCategory, productId;

              // Try snapshot first (v2.0 schema)
              if (item.snapshot) {
                productName = item.snapshot.name;
                productCategory = item.snapshot.categoryName || "Uncategorized";
                productId = item.productId || item.product;
              }
              // Fallback to old schema (v1.0)
              else if (item.productName) {
                productName = item.productName;
                productCategory = item.productCategory || "Uncategorized";
                productId = item.product?._id || item.product;
              }
              // Fallback to populated product (very old orders)
              else if (item.product) {
                productName = item.product.name || "Unknown Product";
                productCategory = item.product.category?.name || item.product.category || "Uncategorized";
                productId = item.product._id || item.product;
              }
              // Last resort
              else {
                productName = "Unknown Product";
                productCategory = "Uncategorized";
                productId = `unknown_${Date.now()}`;
              }

              const quantity = item.qty || 0;

              // Group sales by category
              if (productCategory) {
                if (!categoryMap[productCategory]) categoryMap[productCategory] = 0;
                categoryMap[productCategory] += quantity;
              }

              // Group sales by product
              if (!productMap[productId]) {
                productMap[productId] = {
                  id: productId,
                  title: productName,
                  sold: 0,
                };
              }
              productMap[productId].sold += quantity;
            });
          });

          // ✅ Pie chart data (category-wise)
          const categoryChartData = Object.keys(categoryMap).map((key) => ({
            name: key,
            value: categoryMap[key],
          }));
          setCategoryData(categoryChartData);

          // ✅ Bar chart data (top 5 products)
          const sortedProducts = Object.values(productMap).sort(
            (a, b) => b.sold - a.sold
          );
          setTopProducts(sortedProducts.slice(0, 5));
        }
      } catch (err) {
        console.error("❌ Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dateRange]); // Re-fetch when date range changes

  return (
    <PageContainer>
      <div className="max-w-7xl w-full mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
            Analytics Dashboard
          </h2>

          {/* Date Range Filter */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDateRange("7")}
              className={`px-4 py-2 rounded-lg font-medium transition ${dateRange === "7"
                ? "bg-green-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange("30")}
              className={`px-4 py-2 rounded-lg font-medium transition ${dateRange === "30"
                ? "bg-green-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange("90")}
              className={`px-4 py-2 rounded-lg font-medium transition ${dateRange === "90"
                ? "bg-green-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setDateRange("365")}
              className={`px-4 py-2 rounded-lg font-medium transition ${dateRange === "365"
                ? "bg-green-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              Last Year
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Pie Chart: Sales by Category */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4 group">
              <FaChartPie className="text-purple-500 text-2xl transition-transform duration-300 group-hover:rotate-12" />
              <h3 className="text-xl font-bold text-black">
                Sales by Category
              </h3>
            </div>

            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ color: "black" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-black/70 mt-10 font-medium">
                No delivered order data found for the selected period.
              </p>
            )}
          </div>

          {/* Bar Chart: Top Selling Products */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4 group">
              <FaBoxOpen className="text-yellow-500 text-2xl transition-transform duration-300 group-hover:rotate-12" />
              <h3 className="text-xl font-bold text-black">
                Top Selling Products
              </h3>
            </div>

            {topProducts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <XAxis dataKey="title" hide />
                    <YAxis tick={{ fill: 'black' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'black', borderRadius: '8px' }} />
                    <Bar
                      dataKey="sold"
                      radius={[6, 6, 0, 0]}
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Product List */}
                <ul className="mt-6 space-y-3">
                  {topProducts.map((p, index) => (
                    <li
                      key={p.id}
                      className="flex justify-between items-center bg-white/40 backdrop-blur-md rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/60 transition border border-white/20"
                    >
                      <span className="truncate w-2/3 text-black">
                        {p.title}
                      </span>
                      <span className="font-bold text-black">
                        {p.sold} sold
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-center text-black/70 mt-10 font-medium">
                No sales data available for the selected period.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Analytics;
