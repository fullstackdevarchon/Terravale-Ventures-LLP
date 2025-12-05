import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardList,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaWarehouse,
  FaTruck,
  FaTags,
  FaChevronDown,
  FaUserPlus,
  FaListUl,
  FaTasks,
} from "react-icons/fa";

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const managementDropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login", { replace: true });
    window.location.reload();
  };

  // Products dropdown items (Product List + Seller Requests)
  const productsLinks = [
    { path: "products", icon: FaBoxOpen, text: "Product List", color: "text-yellow-400" },
    { path: "seller-requests", icon: FaClipboardList, text: "Seller Requests", color: "text-blue-400" },
  ];

  const managementLinks = [
    { path: "analytics", icon: FaChartLine, text: "Analytics", color: "text-purple-400" },
    { path: "inventory", icon: FaWarehouse, text: "Inventory", color: "text-emerald-400" },
    { path: "categories", icon: FaTags, text: "Categories", color: "text-pink-400" },
  ];

  const deliveryLinks = [
    { path: "delivery/add-labour", text: "Add Labour", icon: FaUserPlus, color: "text-cyan-400" },
    { path: "delivery/labour-list", text: "Labour List", icon: FaListUl, color: "text-indigo-400" },
    { path: "delivery/labour-orders", text: "Labour Orders", icon: FaClipboardList, color: "text-teal-400" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDeliveryOpen(false);
      }
      if (managementDropdownRef.current && !managementDropdownRef.current.contains(e.target)) {
        setManagementOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(e.target)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔒 Lock Body Scroll when Mobile Menu is Open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url('/assets/IMG-20251013-WA0000.jpg')` }}
    >
      {/* 🔹 Top Navbar */}
      <nav
        className="
          fixed top-0 left-0 w-full z-50
          bg-cover bg-center bg-fixed bg-no-repeat
          shadow-lg border-b border-white/20
        "
        style={{
          backgroundImage: `url('/assets/IMG-20251013-WA0000.jpg')`,
        }}
      >
        <div className="bg-[rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* 🔹 Logo + Title */}
            <Link to="/admin-dashboard" className="flex items-center gap-3">
              <img
                src="/assets/IMG-20251006-WA0016(1) (1).jpg"
                alt="Logo"
                className="h-14 w-14 rounded-full border border-white shadow"
              />
              <div>
                <h1 className="text-white  text-2xl drop-shadow-md tracking-wide leading-tight">
                  Admin Dashboard
                </h1>
              </div>
            </Link>

            {/* 🔹 Desktop / Tablet Links */}
            <div className="hidden md:flex gap-5 text-white font-semibold text-base items-center leading-tight">
              {/* Orders Link - First */}
              <Link
                to="/admin-dashboard/orders"
                className="flex items-center gap-2 px-3 py-2 rounded-md transition duration-200 hover:bg-[rgba(27,60,43,0.6)] hover:text-black focus:text-yellow-300 active:text-yellow-300 leading-tight"
              >
                Orders
              </Link>

              {/* 🔹 Products Dropdown (Product List + Seller Requests) */}
              <div className="relative" ref={productsDropdownRef}>
                <button
                  onClick={() => setProductsOpen(!productsOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md transition duration-200 hover:bg-[rgba(27,60,43,0.6)] hover:text-black focus:text-yellow-300 active:text-yellow-300 font-semibold leading-tight"
                >
                  Products
                  <FaChevronDown
                    className={`text-xs transition-transform duration-300 ${productsOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <div
                  className={`absolute right-0 mt-3 w-48 bg-white text-gray-900 rounded-lg shadow-xl animate-fadeIn border border-white/40 transition-all duration-300 transform origin-top ${productsOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                >
                  {productsLinks.map(({ path, text, icon: Icon, color }) => (
                    <Link
                      key={path}
                      to={`/admin-dashboard/${path}`}
                      onClick={() => setProductsOpen(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-100 font-semibold text-base leading-tight"
                    >
                      {text}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 🔹 Management Dropdown (Desktop) */}
              <div className="relative" ref={managementDropdownRef}>
                <button
                  onClick={() => setManagementOpen(!managementOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md transition duration-200 hover:bg-[rgba(27,60,43,0.6)] hover:text-black focus:text-yellow-300 active:text-yellow-300 font-semibold leading-tight"
                >
                  Management
                  <FaChevronDown
                    className={`text-xs transition-transform duration-300 ${managementOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <div
                  className={`absolute right-0 mt-3 w-48 bg-white text-gray-900 rounded-lg shadow-xl animate-fadeIn border border-white/40 transition-all duration-300 transform origin-top ${managementOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                >
                  {managementLinks.map(({ path, text, icon: Icon, color }) => (
                    <Link
                      key={path}
                      to={`/admin-dashboard/${path}`}
                      onClick={() => setManagementOpen(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-100 font-semibold text-base leading-tight"
                    >
                      {text}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 🔹 Delivery Dropdown (Desktop) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDeliveryOpen(!deliveryOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md transition duration-200 hover:bg-[rgba(27,60,43,0.6)] hover:text-black focus:text-yellow-300 active:text-yellow-300 font-semibold leading-tight"
                >
                  Delivery
                  <FaChevronDown
                    className={`text-xs transition-transform duration-300 ${deliveryOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <div
                  className={`absolute right-0 mt-3 w-48 bg-white text-gray-900 rounded-lg shadow-xl animate-fadeIn border border-white/40 transition-all duration-300 transform origin-top ${deliveryOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                >
                  {deliveryLinks.map(({ path, text, icon: Icon, color }) => (
                    <Link
                      key={path}
                      to={`/admin-dashboard/${path}`}
                      onClick={() => setDeliveryOpen(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-100 font-semibold text-base leading-tight"
                    >
                      {text}
                    </Link>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="
                    flex items-center px-4 py-2 
                    border border-white/40 text-white
                    rounded-md bg-white/10 
                    hover:bg-red-600 hover:scale-105
                    transition shadow-md font-semibold text-base leading-tight
                  "
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>

            {/* 🔹 Mobile Menu Button */}
            <button
              className="md:hidden text-white text-2xl focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* 🔹 Mobile / Tablet Menu Overlay */}
        <div
          className={`fixed left-0 right-0 bottom-0 bg-black/95 z-40 transition-transform duration-300 md:hidden flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          style={{ top: "88px" }} // Adjust based on navbar height
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-40">
            {/* Orders Link - First */}
            <Link
              to="/admin-dashboard/orders"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-4 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
            >
              <span className="text-lg font-semibold text-white leading-tight">Orders</span>
            </Link>

            {/* 🔹 Products Dropdown (Mobile) */}
            <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="w-full py-4 px-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-white leading-tight">Products</span>
                </div>
                <FaChevronDown
                  className={`text-white transition-transform duration-300 ${productsOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div
                className={`bg-black/20 transition-all duration-300 ${productsOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0 py-0"
                  } overflow-hidden`}
              >
                {productsLinks.map(({ path, text, icon: Icon, color }) => (
                  <Link
                    key={path}
                    to={`/admin-dashboard/${path}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-8 py-3 hover:bg-white/10 text-white/90 transition-colors"
                  >
                    <span className="font-semibold text-base leading-tight">{text}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 🔹 Management Dropdown (Mobile) */}
            <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
              <button
                onClick={() => setManagementOpen(!managementOpen)}
                className="w-full py-4 px-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-white leading-tight">Management</span>
                </div>
                <FaChevronDown
                  className={`text-white transition-transform duration-300 ${managementOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div
                className={`bg-black/20 transition-all duration-300 ${managementOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0 py-0"
                  } overflow-hidden`}
              >
                {managementLinks.map(({ path, text, icon: Icon, color }) => (
                  <Link
                    key={path}
                    to={`/admin-dashboard/${path}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-8 py-3 hover:bg-white/10 text-white/90 transition-colors"
                  >
                    <span className="font-semibold text-base leading-tight">{text}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 🔹 Delivery Dropdown (Mobile) */}
            <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
              <button
                onClick={() => setDeliveryOpen(!deliveryOpen)}
                className="w-full py-4 px-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-white leading-tight">Delivery</span>
                </div>
                <FaChevronDown
                  className={`text-white transition-transform duration-300 ${deliveryOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div
                className={`bg-black/20 transition-all duration-300 ${deliveryOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0 py-0"
                  } overflow-hidden`}
              >
                {deliveryLinks.map(({ path, text, icon: Icon, color }) => (
                  <Link
                    key={path}
                    to={`/admin-dashboard/${path}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-8 py-3 hover:bg-white/10 text-white/90 transition-colors"
                  >
                    <span className="font-semibold text-base leading-tight">{text}</span>
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="mt-auto w-full py-4 rounded-xl bg-red-600/20 border border-red-500/50 text-red-100 font-semibold text-base hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 leading-tight"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* 🔹 Main Page Content */}
      <main className="flex-1 pt-24 px-4 sm:px-6 md:px-8 lg:px-10 animate-fadeIn bg-black/60">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminNavbar;
