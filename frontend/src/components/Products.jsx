import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaShoppingCart, FaCreditCard, FaFilter, FaSortAmountDown, FaWeightHanging, FaBoxes, FaTimes } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "axios";
import API_BASE from "../config";

const ProductList = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false); // Default hidden

  const dispatch = useDispatch();

  // Price Range Options
  const PRICE_RANGES = [
    { label: "₹0 - ₹100", min: 0, max: 100 },
    { label: "₹100 - ₹200", min: 100, max: 200 },
    { label: "₹200 - ₹500", min: 200, max: 500 },
    { label: "₹500 - ₹1000", min: 500, max: 1000 },
    { label: "₹1000+", min: 1000, max: Infinity },
  ];

  const addProduct = (product) => {
    const productDetails = {
      id: product._id,
      name: product.name,
      price: product.price,
      weight: product.weight || "",
      image: product.image?.url || "",
      description: product.description,
      qty: 1,
    };
    dispatch(addCart(productDetails));
    toast.success("Added to cart!");
  };

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/v1/products/buyer`);
        if (res.data.success) {
          setData(res.data.products);
          setFilter(res.data.products);
        }
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/v1/categories/enabled`);
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Apply Filters & Sort
  useEffect(() => {
    let updatedList = [...data];

    // 1. Category Filter
    if (category !== "All") {
      updatedList = updatedList.filter((item) => item.category?._id === category);
    }

    // 2. Price Filter
    if (priceRanges.length > 0) {
      updatedList = updatedList.filter((item) => {
        return priceRanges.some((rangeLabel) => {
          const range = PRICE_RANGES.find(r => r.label === rangeLabel);
          if (!range) return false;
          return item.price >= range.min && item.price <= range.max;
        });
      });
    }

    // 3. Sorting
    if (sortBy === "price_low_high") {
      updatedList.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high_low") {
      updatedList.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      updatedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilter(updatedList);
  }, [category, priceRanges, sortBy, data]);

  const handlePriceChange = (label) => {
    setPriceRanges((prev) =>
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
    );
  };

  // Skeleton loader
  const Loading = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="border rounded-xl p-6 shadow-lg bg-white/40 backdrop-blur-xl min-h-[400px]"
        >
          <Skeleton height={220} />
          <Skeleton className="mt-4" count={3} />
        </div>
      ))}
    </div>
  );

  return (
    <section className="container mx-auto py-16 px-4 mt-20 min-h-screen">

      {/* Header Section */}
      <div className="relative flex flex-col md:flex-row items-center justify-center mb-10 gap-4">
        {/* Filter Button - Absolute Left or Flex Start */}
        <div className="w-full md:w-auto md:absolute md:left-0 flex justify-start z-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="group flex items-center gap-3 px-6 py-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
          >
            {showFilters ? <FaTimes /> : <FaFilter />}
            {showFilters ? "Close Filters" : "Filter Products"}
          </button>
        </div>

        {/* Centered Heading */}
        <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          Latest Products
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative items-start">

        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="lg:w-1/4 w-full bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 text-white animate-fade-in-left">

            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaFilter className="text-green-400" /> Filters
              </h3>
              <button onClick={() => setShowFilters(false)} className="lg:hidden text-white/70 hover:text-red-400 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Sort By */}
            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-wider text-white/70 font-bold mb-3 flex items-center gap-2">
                <FaSortAmountDown /> Sort By
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 rounded-xl border border-white/30 bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
              </select>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-wider text-white/70 font-bold mb-3">Categories</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                <div
                  onClick={() => setCategory("All")}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                    ${category === "All" ? 'bg-green-500/20 border-green-500/50 border' : 'hover:bg-white/10 border border-transparent'}
                  `}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${category === "All" ? 'border-green-400' : 'border-white/50'}
                  `}>
                    {category === "All" && <div className="w-2 h-2 rounded-full bg-green-400" />}
                  </div>
                  <span className={`font-medium ${category === "All" ? 'text-green-400' : 'text-white/80'}`}>All Categories</span>
                </div>

                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    onClick={() => setCategory(cat._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                      ${category === cat._id ? 'bg-green-500/20 border-green-500/50 border' : 'hover:bg-white/10 border border-transparent'}
                    `}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${category === cat._id ? 'border-green-400' : 'border-white/50'}
                    `}>
                      {category === cat._id && <div className="w-2 h-2 rounded-full bg-green-400" />}
                    </div>
                    <span className={`font-medium ${category === cat._id ? 'text-green-400' : 'text-white/80'}`}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-white/70 font-bold mb-3">Price Range</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <div
                    key={range.label}
                    onClick={() => handlePriceChange(range.label)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                      ${priceRanges.includes(range.label) ? 'bg-green-500/20 border-green-500/50 border' : 'hover:bg-white/10 border border-transparent'}
                    `}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${priceRanges.includes(range.label) ? 'bg-green-500 border-green-500' : 'border-white/50 bg-transparent'}
                    `}>
                      {priceRanges.includes(range.label) && <FaFilter className="text-white text-xs" />}
                    </div>
                    <span className={`font-medium ${priceRanges.includes(range.label) ? 'text-green-400' : 'text-white/80'}`}>
                      {range.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className={`transition-all duration-500 ease-in-out ${showFilters ? 'lg:w-3/4' : 'w-full'}`}>
          {loading ? (
            <Loading />
          ) : filter.length > 0 ? (
            <div className={`grid gap-8 ${showFilters ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {filter.map((product) => (
                <div
                  key={product._id}
                  className="rounded-2xl shadow-xl bg-white/20 backdrop-blur-xl 
                  hover:shadow-3xl hover:-translate-y-2 transition-all border border-white/40 
                  overflow-hidden relative group flex flex-col"
                >
                  {/* Hover Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <Link
                      to={`/product/${product._id}`}
                      className="p-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
                    >
                      <FaCreditCard />
                    </Link>

                    <button
                      onClick={() => addProduct(product)}
                      className="p-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
                    >
                      <FaShoppingCart />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-56 bg-gray-200/20 overflow-hidden relative">
                    <img
                      src={product.image?.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.quantity <= 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold border-2 border-white px-3 py-1 rounded">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5 text-white flex-1 flex flex-col">
                    <h2 className="text-lg font-bold mb-2 line-clamp-1 text-black group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-sm text-black mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center border-t border-white/30 pt-3 mt-auto">
                      <div>
                        <p className="text-xs text-black font-bold text-xl">Price</p>
                        <p className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                          ₹ {product.price}
                          <span className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                            ({product.weight})
                          </span>
                        </p>
                      </div>

                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded
                        ${product.quantity > 0 ? 'bg-green-200/20 text-green-900' : 'bg-red-200/20 text-red-900'}`}>
                        <FaBoxes /> {product.quantity > 0 ? product.quantity : '0'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-white/70">
              <FaFilter className="text-5xl mb-4 opacity-50" />
              <p className="text-xl">No products match your filters</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
