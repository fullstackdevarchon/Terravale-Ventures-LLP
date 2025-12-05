import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaExclamationTriangle,
  FaBoxOpen,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import toast from "react-hot-toast";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";
import API_BASE from "../../config";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true); // ✅ added loading state

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // ✅ Include withCredentials so cookies/JWT go with the request
        const res = await axios.get(
          `${API_BASE}/api/v1/products/all`,
          { withCredentials: true }
        );

        if (res.data && res.data.success) {
          // ✅ Only approved products
          const approvedProducts = res.data.products.filter(
            (p) => p.status === "approved"
          );

          const formatted = approvedProducts.map((p) => {
            let stockStatus = "In Stock";
            if (p.quantity === 0) stockStatus = "Out of Stock";
            else if (p.quantity > 0 && p.quantity <= 10)
              stockStatus = "Low Stock";

            return {
              id: p._id,
              product: p.name,
              stock: p.quantity,
              status: stockStatus,
            };
          });

          setInventory(formatted);
        } else {
          toast.error("Failed to load inventory");
        }
      } catch (err) {
        console.error("❌ Inventory fetch error:", err);
        toast.error(
          err.response?.data?.message || "Error fetching inventory"
        );
      } finally {
        setLoading(false); // ✅ Stop loading after fetch
      }
    };

    fetchInventory();
  }, []);

  // // ✅ Show Preloader during fetch
  // if (loading) {
  //   return <Preloader />;
  // }

  // 🔍 Filtered data
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.product
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "All" ? true : item.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    if (status === "Low Stock")
      return (
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs md:text-sm font-semibold inline-flex items-center gap-1 shadow-sm">
          <FaExclamationTriangle className="text-yellow-600 text-xs md:text-sm" />
          Low Stock
        </span>
      );
    if (status === "Out of Stock")
      return (
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs md:text-sm font-semibold inline-flex items-center gap-1 shadow-sm">
          <FaExclamationTriangle className="text-red-600 text-xs md:text-sm" />
          Out of Stock
        </span>
      );
    return (
      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs md:text-sm font-semibold shadow-sm">
        In Stock
      </span>
    );
  };

  return (
    <PageContainer>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        {/* Page Title */}
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          <FaBoxOpen className="text-emerald-500 text-3xl md:text-5xl" />
          <span>Inventory & Stock</span>
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-4 text-black z-10" />
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-3 rounded-xl bg-white/40 border border-white/30 text-black placeholder-black/50 shadow-sm focus:ring-2 focus:ring-white focus:outline-none text-sm md:text-base backdrop-blur-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FaFilter className="text-blue-500 text-sm md:text-base" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-white/40 border border-white/30 text-black shadow-sm focus:ring-2 focus:ring-white focus:outline-none text-sm md:text-base backdrop-blur-sm"
            >
              <option value="All">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 flex flex-col gap-3 md:gap-4 hover:shadow-2xl transition hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3 group">
                  <div className="bg-white/20 p-2 md:p-3 rounded-full">
                    <FaBoxOpen className="text-emerald-500 text-lg md:text-2xl transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-black font-bold text-sm md:text-lg truncate">
                      {item.product}
                    </span>
                    <span className="text-black/70 text-xs md:text-base font-medium truncate">
                      ID: {item.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-2">
                  <span className="text-black font-semibold text-sm md:text-base">
                    Stock: <span className="text-white font-bold">{item.stock}</span>
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-black/70 italic text-sm md:text-base font-medium bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              No approved products found
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-white/20 backdrop-blur-md border border-white/30 text-black text-sm md:text-base flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 mt-6 rounded-xl font-medium shadow-lg">
          <span>Total Approved Products: {filteredInventory.length}</span>
          <span className="font-bold">
            Low / Out of Stock:{" "}
            {
              filteredInventory.filter(
                (i) => i.status === "Low Stock" || i.status === "Out of Stock"
              ).length
            }
          </span>
        </div>
      </div>
    </PageContainer>
  );
};

export default Inventory;
