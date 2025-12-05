import React, { useState, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaTrash, FaChevronDown, FaPepperHot, FaAppleAlt, FaLeaf, FaBox, FaSearch } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import PageContainer from "../../components/PageContainer";
import Preloader from "../../components/Preloader";
import API_BASE from "../../config";

const ProductListAdmin = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // ✅ Show Preloader for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Fetch enabled categories first
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/v1/categories/all`, {
        withCredentials: true,
      });
      if (data.success) {
        const enabled = data.categories.filter((c) => c.enabled);
        setCategories(enabled);
        return enabled; // Return enabled categories for use in filtering products
      }
      return [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching categories");
      return [];
    }
  };

  // ✅ Fetch products (only approved with enabled categories)
  const fetchProducts = async (enabledCategories) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/api/v1/products/all`, {
        withCredentials: true,
      });
      if (data.success) {
        // Filter for approved products only
        const approved = data.products.filter((p) => p.status === "approved");

        // Filter to only show products with enabled categories
        const enabledCategoryIds = enabledCategories.map(cat => cat._id);
        const productsWithEnabledCategories = approved.filter(product =>
          enabledCategoryIds.includes(product.category?._id)
        );

        setData(productsWithEnabledCategories);
        setFilter(productsWithEnabledCategories);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      const enabledCats = await fetchCategories();
      await fetchProducts(enabledCats);
    };
    fetchData();
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Filter products by category and search query
  const filterProduct = (catId, catName) => {
    setCategory(catName);
    setDropdownOpen(false);

    // Filter products to only show those with enabled categories
    const enabledCategoryIds = categories.map(cat => cat._id);
    const productsWithEnabledCategories = data.filter(item =>
      enabledCategoryIds.includes(item.category?._id)
    );

    let filtered = productsWithEnabledCategories;

    // Apply category filter
    if (catName !== "All") {
      filtered = filtered.filter((item) => item.category?._id === catId);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilter(filtered);
  };

  // ✅ Delete product
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE}/api/v1/products/${id}`, {
          withCredentials: true,
        });
        const updatedData = data.filter((item) => item._id !== id);
        setData(updatedData);
        setFilter(
          category === "All"
            ? updatedData
            : updatedData.filter((item) => item.category?.name === category)
        );
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting product");
      }
    }
  };

  // ✅ Category icons
  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case "spices":
        return <FaPepperHot className="text-red-500 transition-transform duration-300 group-hover:rotate-12" />;
      case "fruits":
        return <FaAppleAlt className="text-green-500 transition-transform duration-300 group-hover:rotate-12" />;
      case "vegetables":
        return <FaLeaf className="text-emerald-600 transition-transform duration-300 group-hover:rotate-12" />;
      default:
        return <FaBox className="text-gray-500 transition-transform duration-300 group-hover:rotate-12" />;
    }
  };

  // ✅ Skeleton Loader
  const Loading = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-pulse">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="border rounded-xl p-6 shadow-lg bg-white min-h-[420px]"
        >
          <Skeleton height={220} />
          <Skeleton className="mt-4" count={3} />
        </div>
      ))}
    </div>
  );

  // ✅ Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter products by search query and current category
    const enabledCategoryIds = categories.map(cat => cat._id);
    let filtered = data.filter(item =>
      enabledCategoryIds.includes(item.category?._id)
    );

    // Apply category filter
    if (category !== "All") {
      const selectedCategory = categories.find(cat => cat.name === category);
      if (selectedCategory) {
        filtered = filtered.filter((item) => item.category?._id === selectedCategory._id);
      }
    }

    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilter(filtered);
  };

  // ✅ Product Display Section
  const ShowProducts = () => (
    <>
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black z-10" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 text-black placeholder-black/50 shadow-lg focus:ring-2 focus:ring-white focus:outline-none font-medium"
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full md:w-64" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full bg-white/40 backdrop-blur-md border border-white/30 rounded-lg shadow-lg pl-4 pr-10 py-3 text-lg text-black font-bold hover:bg-white/50 flex justify-between items-center transition"
          >
            {category === "All"
              ? "All Categories"
              : category.charAt(0).toUpperCase() + category.slice(1)}
            <FaChevronDown className="ml-2 text-black" />
          </button>
          {dropdownOpen && (
            <div className="absolute mt-1 w-full bg-white/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-10 max-h-60 overflow-auto">
              <div
                onClick={() => filterProduct(null, "All")}
                className="cursor-pointer px-4 py-3 hover:bg-green-100 text-lg transition text-black font-medium"
              >
                All Categories
              </div>
              {categories.map((catOption) => (
                <div
                  key={catOption._id}
                  onClick={() => filterProduct(catOption._id, catOption.name)}
                  className="cursor-pointer px-4 py-3 hover:bg-green-100 text-lg transition text-black font-medium"
                >
                  {catOption.name.charAt(0).toUpperCase() + catOption.name.slice(1)}
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
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl hover:scale-[1.02] transition duration-300 overflow-hidden relative flex flex-col h-full group"
          >
            {/* Delete Button */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => deleteProduct(product._id)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg flex items-center justify-center"
              >
                <FaTrash />
              </button>
            </div>

            {/* Product Image */}
            <div className="w-full h-48 overflow-hidden bg-white/20">
              <img
                src={product.image?.url || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>

            {/* Product Info */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 text-black line-clamp-2">
                  {product.name}
                </h2>
                <p className="text-black text-sm mb-4 line-clamp-2 font-medium">
                  {product.description || "No description available"}
                </p>
              </div>

              <div className="mb-3 flex justify-between items-center">
                <p className="text-black text-sm font-semibold flex items-center gap-1">
                  Stock: <span className="font-bold text-white text-sm">{product.quantity || 0}</span>
                </p>
                <div className="flex items-center gap-1">
                  <div className="text-sm bg-white/30 p-1 rounded-full border border-white/20">
                    {getCategoryIcon(product.category?.name)}
                  </div>
                  <p className="text-xs text-black font-semibold">
                    {product.category?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center">
                <p className="text-2xl font-extrabold text-white">
                  ₹ {product.price}
                </p>
                {product.weight && (
                  <span className="text-sm text-black font-bold bg-white/30 px-2 py-1 rounded border border-white/20">
                    {product.weight}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filter.length === 0 && (
        <p className="text-center text-black/70 mt-6 text-lg font-medium bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
          No approved products found.
        </p>
      )}
    </>
  );

  // // ✅ Display Preloader for 2 seconds before showing content
  // if (showPreloader) {
  //   return <Preloader />;
  // }

  return (
    <PageContainer>
      <section>
        <h2 className="text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          Approved Product List
        </h2>
        {loading ? <Loading /> : <ShowProducts />}
      </section>
    </PageContainer>
  );
};

export default ProductListAdmin;
