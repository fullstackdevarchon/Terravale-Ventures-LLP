// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import Preloader from "./Preloader";
import { Link } from "react-router-dom";

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Preloader />;

  return (
    <section className="w-full font-poppins">

      {/* HERO SECTION */}
      <div
        className="
          flex items-center justify-center
          min-h-screen w-full 
          bg-cover bg-center bg-no-repeat
          animate-zoomBg
        "
        style={{
          backgroundImage: "url('/assets/home-bg.jpg')",
        }}
      >
        {/* Soft Overlay (makes text readable) */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/10 to-white/20"></div>

        {/* CONTENT BLOCK */}
        <div
          className="
            relative z-10 container mx-auto px-4 sm:px-6 md:px-8
            text-center md:text-left
            flex flex-col justify-center
            items-center md:items-start 
            py-20 sm:py-28 md:py-36
            animate-fadeUp
          "
        >
          {/* TITLE */}
          <h1
            className="
              text-[#1C3F2C] 
              text-3xl sm:text-4xl lg:text-5xl 
              font-extrabold 
              mb-6 leading-tight tracking-wide 
              drop-shadow-lg
            "
          >
            Welcome to{" "}
            <span className="text-[#1C3F2C]">Terravale Ventures LLP</span>
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              text-black
              text-base sm:text-lg md:text-xl lg:text-2xl
              max-w-6xl leading-relaxed mb-10 
              drop-shadow
              font-light
              animate-fadeInSlow
            "
          >
            Terravale Ventures LLP connects farmers and customers directly —
            delivering fresh produce, authentic products, and trusted services.
            Explore the latest agricultural solutions, empowering communities
            for a sustainable tomorrow.
          </p>

          {/* BUTTON */}
          <Link to="/login" className="w-full sm:w-auto flex justify-center md:justify-start">
            <button
              className="
                    flex items-center justify-center
                    px-6 py-3 sm:px-8 sm:py-4
                    w-full sm:w-auto max-w-xs sm:max-w-none
                    border border-white/40 text-black text-base sm:text-lg
                    rounded-md bg-white/10 
                    hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-white
                    transition shadow-md font-semibold
              "
            >
              Explore Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
