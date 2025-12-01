import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../../redux/action";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import toast from "react-hot-toast";
import { FaShoppingCart, FaCreditCard, FaFilter, FaSortAmountDown, FaWeightHanging, FaBoxes, FaTimes } from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

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
  const navigate = useNavigate();

  // Price Range Options
  const PRICE_RANGES = [
    { label: "₹0 - ₹100", min: 0, max: 100 },
    { label: "₹100 - ₹200", min: 100, max: 200 },
    { label: "₹200 - ₹500", min: 200, max: 500 },
    { label: "₹500 - ₹1000", min: 500, max: 1000 },
    { label: "₹1000+", min: 1000, max: Infinity },
  ];

  // Add to cart
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
    toast.success(`${product.name} added to cart!`);
  };

  // Navigate to product page
  const buyProduct = (id) => navigate(`/buyer-dashboard/product/${id}`);

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/v1/products/buyer");
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
        const res = await axios.get("http://localhost:5000/api/v1/categories/enabled");
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

  // Skeleton Loader
  const Loading = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="border rounded-2xl p-4 shadow-xl bg-white/20 backdrop-blur-xl min-h-[350px]">
          <Skeleton height={200} />
          <Skeleton className="mt-4" count={3} />
        </div>
      ))}
    </div>
  );

  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4 mt-16 min-h-screen">

        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row items-center justify-center mb-10 gap-4">
          {/* Filter Button - Absolute Left or Flex Start */}
          <div className="w-full md:w-auto md:absolute md:left-0 flex justify-start z-10">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                group flex items-center gap-3 px-6 py-3 rounded-full font-bold tracking-wide transition-all duration-300 shadow-lg hover:shadow-blue-500/30 active:scale-95
                ${showFilters
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-600'
                }
              `}
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              {showFilters ? "Close Filters" : "Filter Products"}
            </button>
          </div>

          {/* Centered Heading */}
          <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
            Marketplace
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative items-start">

          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="lg:w-1/4 w-full bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50 animate-fade-in-left">

              <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaFilter className="text-blue-600" /> Filters
                </h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden text-gray-500 hover:text-red-500 transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                  <FaSortAmountDown /> Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer hover:bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                </select>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3">Categories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  <div
                    onClick={() => setCategory("All")}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                      ${category === "All" ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50 border border-transparent'}
                    `}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${category === "All" ? 'border-blue-600' : 'border-gray-400'}
                    `}>
                      {category === "All" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className={`font-medium ${category === "All" ? 'text-blue-700' : 'text-gray-600'}`}>All Categories</span>
                  </div>

                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      onClick={() => setCategory(cat._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                        ${category === cat._id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50 border border-transparent'}
                      `}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${category === cat._id ? 'border-blue-600' : 'border-gray-400'}
                      `}>
                        {category === cat._id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className={`font-medium ${category === cat._id ? 'text-blue-700' : 'text-gray-600'}`}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3">Price Range</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <div
                      key={range.label}
                      onClick={() => handlePriceChange(range.label)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                        ${priceRanges.includes(range.label) ? 'bg-green-50 border-green-200 border' : 'hover:bg-gray-50 border border-transparent'}
                      `}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                        ${priceRanges.includes(range.label) ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'}
                      `}>
                        {priceRanges.includes(range.label) && <FaFilter className="text-white text-xs" />}
                      </div>
                      <span className={`font-medium ${priceRanges.includes(range.label) ? 'text-green-700' : 'text-gray-600'}`}>
                        {range.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <main className={`transition-all duration-500 ease-in-out ${showFilters ? 'lg:w-3/4' : 'w-full'}`}>
            {loading ? (
              <Loading />
            ) : filter.length > 0 ? (
              <div className={`grid gap-8 ${showFilters ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {filter.map((product) => (
                  <div
                    key={product._id}
                    className="rounded-2xl shadow-lg bg-white/90 backdrop-blur-xl 
                    hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-200 
                    overflow-hidden relative group flex flex-col"
                  >
                    {/* Hover Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <button
                        onClick={() => buyProduct(product._id)}
                        className="p-3 bg-white text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-white rounded-full shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300"
                        title="Buy Now"
                      >
                        <FaCreditCard className="text-lg" />
                      </button>

                      <button
                        onClick={() => addProduct(product)}
                        className="p-3 bg-white text-emerald-500 border border-emerald-500 hover:bg-emerald-500 hover:text-white rounded-full shadow-lg transform hover:scale-110 hover:-rotate-6 transition-all duration-300"
                        title="Add to Cart"
                      >
                        <FaShoppingCart className="text-lg" />
                      </button>
                    </div>

                    {/* Image */}
                    <div className="w-full h-56 bg-gray-100 overflow-hidden relative">
                      <img
                        src={product.image?.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.quantity <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg border-2 border-white px-4 py-1 rounded-lg">OUT OF STOCK</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <h2 className="text-lg font-bold line-clamp-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h2>

                      <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        {/* Weight */}
                        {product.weight && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                            <FaWeightHanging /> {product.weight}
                          </div>
                        )}

                        {/* Stock */}
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border 
                          ${product.quantity > 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                          <FaBoxes /> {product.quantity > 0 ? `${product.quantity} Left` : 'Sold Out'}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-auto">
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-xl font-bold text-blue-700">₹ {product.price}</p>
                        </div>
                        <button
                          onClick={() => addProduct(product)}
                          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <FaBoxes className="text-6xl mb-4 text-gray-100" />
                <p className="text-xl font-semibold text-gray-100">No products found</p>
                <p className="text-gray-100">Try adjusting your filters</p>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </PageContainer>
  );
};

export default ProductList;
