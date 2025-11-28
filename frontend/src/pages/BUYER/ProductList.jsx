import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../../redux/action";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import toast from "react-hot-toast";
import { FaShoppingCart, FaCreditCard, FaChevronDown, FaTag, FaWeightHanging, FaBoxes } from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

const ProductList = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filterProduct = (catId) => {
    setCategory(catId);
    setDropdownOpen(false);

    if (catId === "All") setFilter(data);
    else setFilter(data.filter((item) => item.category?._id === catId));
  };

  // Skeleton Loader
  const Loading = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="border rounded-2xl p-6 shadow-xl bg-white/20 backdrop-blur-xl min-h-[400px]"
        >
          <Skeleton height={220} />
          <Skeleton className="mt-4" count={3} />
        </div>
      ))}
    </div>
  );

  // Show Products
  const ShowProducts = () => (
    <>
      {/* Dropdown */}
      <div className="flex justify-start mb-8" ref={dropdownRef}>
        <div className="relative w-60">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-white/80 backdrop-blur-xl border border-gray-300 
            rounded-lg shadow-lg pl-4 pr-10 py-3 text-left text-black font-semibold 
            flex justify-between items-center hover:bg-white transition-all duration-300 group"
          >
            {category === "All"
              ? "All Categories"
              : categories.find((c) => c._id === category)?.name}
            <FaChevronDown className="text-black group-hover:text-blue-600 transition-colors duration-300" />
          </button>

          {dropdownOpen && (
            <div className="absolute mt-1 w-full bg-white/90 backdrop-blur-xl 
            border border-gray-200 rounded-lg shadow-xl z-20 max-h-64 overflow-auto">
              <div
                onClick={() => filterProduct("All")}
                className="px-4 py-3 cursor-pointer hover:bg-gray-200 text-gray-800 font-medium"
              >
                All Categories
              </div>

              {categories.map((cat) => (
                <div
                  key={cat._id}
                  onClick={() => filterProduct(cat._id)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-200 text-gray-800 font-medium"
                >
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filter.map((product) => (
          <div
            key={product._id}
            className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-xl 
            hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-200 
            overflow-hidden relative group"
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
            <div className="w-full h-52 bg-gray-200/30 overflow-hidden">
              <img
                src={product.image?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="p-5 text-gray-800 space-y-3">
              {/* Heading / Name */}
              <div className="flex items-start gap-3">
                {/* <div className="mt-1 p-2 bg-purple-100 rounded-full group-hover:bg-purple-500 transition-colors duration-300">
                  <FaTag className="text-purple-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-12 transform" />
                </div> */}
                <h2 className="text-lg font-bold line-clamp-2 text-black group-hover:text-purple-600 transition-colors pt-1">
                  {product.name}
                </h2>
              </div>

              <p className="text-sm text-gray-900 line-clamp-3">
                {product.description}
              </p>

              <div className="flex items-center justify-between pl-1">
                {/* Weight */}
                {product.weight && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 group-hover:border-teal-300 transition-colors">
                    <FaWeightHanging className="text-teal-500 group-hover:animate-bounce" />
                    <span>{product.weight}</span>
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 group-hover:border-rose-300 transition-colors">
                  <FaBoxes className="text-rose-500 group-hover:scale-110 transition-transform" />
                  <span>{product.quantity > 0 ? `${product.quantity} Stock` : 'Out of Stock'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-2xl font-extrabold text-black flex items-center gap-1">
                  <span className="text-lg text-black text-extrabold">Price:</span>
                  ₹ {product.price}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <PageContainer>
      <div className="container mx-auto py-0 px-4 mt-20 min-h-screen">
        <h2 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl
">
          Available Products
        </h2>

        {loading ? <Loading /> : <ShowProducts />}
      </div>
      <Footer />
    </PageContainer>
  );
};

export default ProductList;
