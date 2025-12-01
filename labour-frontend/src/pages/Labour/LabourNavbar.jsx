import { useContext, useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import toast from "react-hot-toast";

import { FiMenu, FiX } from "react-icons/fi";
import { FaClipboardList, FaCheckCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

const LabourNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { name: "Order List", to: "/labour-dashboard/order-list", icon: <FaClipboardList className="text-orange-400" /> },
    { name: "My Orders", to: "/labour-dashboard/my-orders", icon: <FaCheckCircle className="text-green-400" /> },
    { name: "Profile", to: "/labour-dashboard/profile", icon: <FaUser className="text-blue-400" /> },
  ];

  return (
    <PageContainer noContainer={true}>
      <div className="flex flex-col min-h-screen">
        {/* NAVBAR */}
        <nav
          className="fixed top-0 left-0 w-full z-50 shadow-lg border-b border-white/20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/bgc.jpg')`,
          }}
        >
          <div className="bg-black/60">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

              {/* Logo Section */}
              <Link to="/labour-dashboard/order-list" className="flex items-center gap-3">
                <img
                  src="/assets/IMG-20251006-WA0016(1) (1).jpg"
                  alt="Logo"
                  className="h-14 w-14 rounded-full border border-white shadow-md"
                />
                <div>
                  <h1 className="text-white font-bold text-3xl drop-shadow-md">
                    Labour Dashboard
                  </h1>

                </div>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-10 text-white font-medium text-lg">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${isActive
                        ? "text-yellow-300 bg-green-800 border border-green-900"
                        : "text-white hover:text-black hover:bg-green-700/60"
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                ))}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-white/10 border border-white/40 rounded-md
                    hover:bg-red-700 hover:scale-105 hover:text-black transition shadow-md font-semibold text-white"
                >
                  <FaSignOutAlt className="mr-2 text-red-400" />
                  Logout
                </button>
              </div>

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-white"
              >
                {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {isOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden bg-black/70 backdrop-blur-sm text-white px-6 py-4 space-y-4 border-t border-white/30 animate-fadeIn"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block py-3 px-3 rounded-md border-b border-white/20 hover:bg-green-700/60 hover:text-black flex items-center gap-2 ${isActive ? "text-yellow-300" : "text-white"}`
                  }
                >
                  {item.icon} {item.name}
                </NavLink>
              ))}

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full py-3 px-3 rounded-md border border-white/40 hover:bg-red-700 font-semibold flex items-center gap-2"
              >
                <FaSignOutAlt className="text-yellow-300" /> Logout
              </button>
            </div>
          )}
        </nav>

        {/* Page Content */}
        <main className="flex-grow pt-24 px-4 md:px-6 container mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </PageContainer>
  );
};

export default LabourNavbar;