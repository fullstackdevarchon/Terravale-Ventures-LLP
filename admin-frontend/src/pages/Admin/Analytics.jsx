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
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/v1/orders/admin/all`,
          { withCredentials: true }
        );

        if (data.success && data.orders) {
          // ✅ Filter only delivered orders
          const deliveredOrders = data.orders.filter(
            (o) => o.status === "Delivered"
          );

          const categoryMap = {};
          const productMap = {};

          deliveredOrders.forEach((order) => {
            order.products.forEach((item) => {
              const p = item.product;
              if (!p) return;

              // Group sales by category
              if (p.category) {
                if (!categoryMap[p.category]) categoryMap[p.category] = 0;
                categoryMap[p.category] += item.qty;
              }

              // Group sales by product
              if (!productMap[p._id]) {
                productMap[p._id] = {
                  id: p._id,
                  title: p.name || "Unknown Product",
                  sold: 0,
                };
              }
              productMap[p._id].sold += item.qty;
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
        setLoading(false); // ✅ Stop loading after fetch
      }
    };

    fetchOrders();
  }, []);

  // // ✅ Show preloader while fetching
  // if (loading) {
  //   return <Preloader />;
  // }

  return (
    <PageContainer>
      <div className="max-w-7xl w-full mx-auto">
        {/* Header */}
        <h2 className="text-5xl font-extrabold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          Analytics Dashboard
        </h2>

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
                No delivered order data found.
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
                No sales data available.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Analytics;
