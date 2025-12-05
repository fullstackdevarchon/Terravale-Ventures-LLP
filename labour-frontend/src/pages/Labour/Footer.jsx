// src/components/Footer.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";


const Footer = () => {
  const navLinks = [
    { name: "Order List", to: "/labour-dashboard/order-list" },
    { name: "My Orders", to: "/labour-dashboard/my-orders" },
    { name: "Profile", to: "/labour-dashboard/profile" },
  ];

  return (
    <footer className="w-full bg-white/5 backdrop-blur-xl border-t border-white/20 mt-20 py-12 pb-20 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">

        {/* Brand Name */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <img
            src="/assets/IMG-20251006-WA0016(1) (1).jpg"
            alt="Logo"
            className="h-16 w-16 rounded-full border border-white shadow-lg"
          />
          <h2 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
            Terravale Ventures LLP
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 mt-4 text-lg font-semibold">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `
                transition-all duration-300 px-3 py-1 rounded-md
                ${isActive
                  ? "text-[#8FE3A2] underline underline-offset-4 decoration-[rgba(27,60,43,0.9)]"
                  : "text-[#C7DAD1] hover:text-black hover:bg-[rgba(27,60,43,0.6)]"
                }
                `
              }
            >
              {link.icon} {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="flex justify-center gap-5 mt-8 text-xl">
          {[FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp].map((Icon, i) => (
            <a
              key={i}
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-[#C7DAD1]
                p-3 rounded-full 
                transition-all duration-300
                hover:text-black  
                hover:bg-[rgba(27,60,43,0.6)]
                hover:scale-110
              "
            >
              <Icon />
            </a>
          ))}
        </div>

        {/* Divider Line */}
        <div className="w-full h-px bg-white/20 mt-10"></div>

        {/* Copyright */}
        <p className="text-black text-sm mt-6 mb-4 tracking-wide">
          © {new Date().getFullYear()} Terravale Ventures LLP. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
