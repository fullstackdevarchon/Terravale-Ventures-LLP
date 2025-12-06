// src/pages/Checkout.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import { delCart } from "../../redux/action";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";
import { FaHome, FaBuilding } from "react-icons/fa";
import API_BASE from "../../config";

const Checkout = () => {
  const cart = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    street: "",
    street2: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    zip: "",
  });

  // Store fetched addresses to switch between them
  const [savedAddresses, setSavedAddresses] = useState({
    home: null,
    secondary: null,
  });
  const [selectedType, setSelectedType] = useState("HOME");

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // ⭐ FIXED: Confetti state added
  const [showConfetti, setShowConfetti] = useState(true);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = cart.length > 0 ? 30 : 0;
  const total = subtotal + shipping;

  const token = localStorage.getItem("token");

  // FETCH PROFILE
  const fetchProfile = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.user) {
        const user = data.user;

        // Prepare address objects
        const homeAddr = user.address || {};
        const secAddr = user.secondaryAddress || {};

        setSavedAddresses({
          home: {
            street: (homeAddr.street || "").toUpperCase(),
            street2: (homeAddr.street2 || "").toUpperCase(),
            city: (homeAddr.city || "").toUpperCase(),
            district: (homeAddr.district || "").toUpperCase(),
            state: (homeAddr.state || "").toUpperCase(),
            country: (homeAddr.country || "India").toUpperCase(),
            zip: homeAddr.pincode || "",
            type: "HOME"
          },
          secondary: {
            street: (secAddr.street || "").toUpperCase(),
            street2: (secAddr.street2 || "").toUpperCase(),
            city: (secAddr.city || "").toUpperCase(),
            district: (secAddr.district || "").toUpperCase(),
            state: (secAddr.state || "").toUpperCase(),
            country: (secAddr.country || "India").toUpperCase(),
            zip: secAddr.pincode || "",
            type: secAddr.type || "OFFICE"
          },
          // User contact info is common
          contact: {
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            alternatePhone: user.alternatePhone || "",
          }
        });

        // Default to HOME
        setAddress({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          alternatePhone: user.alternatePhone || "",
          street: (homeAddr.street || "").toUpperCase(),
          street2: (homeAddr.street2 || "").toUpperCase(),
          city: (homeAddr.city || "").toUpperCase(),
          district: (homeAddr.district || "").toUpperCase(),
          state: (homeAddr.state || "").toUpperCase(),
          country: (homeAddr.country || "India").toUpperCase(),
          zip: homeAddr.pincode || "",
        });
      }
    } catch (err) {
      toast.error("Could not load user profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Address Type Switch
  const handleAddressTypeChange = (type) => {
    if (!savedAddresses.home) return;

    const targetAddr = type === "HOME" ? savedAddresses.home : savedAddresses.secondary;
    const contact = savedAddresses.contact;

    // If switching to secondary but it's empty, warn user
    if (type !== "HOME" && (!targetAddr.street || !targetAddr.city)) {
      toast("Secondary address is empty in your profile", { icon: "⚠️" });
    }

    setSelectedType(type);
    setAddress({
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      alternatePhone: contact.alternatePhone,
      street: targetAddr.street,
      street2: targetAddr.street2,
      city: targetAddr.city,
      district: targetAddr.district,
      state: targetAddr.state,
      country: targetAddr.country,
      zip: targetAddr.zip,
    });
  };

  // PLACE ORDER
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("PLEASE LOGIN AS BUYER TO PLACE ORDER");
      return navigate("/login");
    }

    setLoading(true);

    try {
      const objectIdRegex = /^[a-fA-F0-9]{24}$/;
      const invalidItems = [];

      const normalizedProducts = cart.map((item) => {
        let pid =
          item?._id || item?.product?._id || item?.productId || item?.id;
        if (typeof pid === "number") pid = String(pid);
        if (pid && typeof pid === "object" && pid._id) pid = pid._id;

        const isValid = typeof pid === "string" && objectIdRegex.test(pid);
        if (!isValid)
          invalidItems.push(item.name || item.title || pid || "Unknown");

        return {
          product: pid,
          qty: Number(item.qty),
          price: Number(item.price),
        };
      });

      if (invalidItems.length > 0) {
        toast.error(`INVALID PRODUCT IDs: ${invalidItems.join(", ")}`);
        setLoading(false);
        return;
      }

      const orderData = {
        products: normalizedProducts,
        address,
        paymentMethod: "Cash on Delivery",
      };

      const { data } = await axios.post(
        `${API_BASE}/api/v1/orders/create`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (data.success) {
        setOrderSuccess(true);
        setShowConfetti(true);

        toast.success("ORDER PLACED SUCCESSFULLY!");

        cart.forEach((item) => dispatch(delCart(item)));

        // Stop Confetti after 3s
        setTimeout(() => setShowConfetti(false), 3000);

        // Redirect after 3s
        setTimeout(() => {
          navigate("/buyer-dashboard/orders");
        }, 3000);
      } else {
        toast.error(data.message || "FAILED TO PLACE ORDER");
      }
    } catch (err) {
      toast.error("ORDER FAILED. TRY AGAIN.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <PageContainer>

        {/* CONFETTI */}
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={700}
            gravity={0.2}
            wind={0.02}
            recycle={false}
          />
        )}

        <div className="flex flex-col items-center justify-center h-screen text-center">

          {/* TRUCK ANIMATION */}
          <div className="relative w-64 h-32 mb-10 overflow-hidden">
            <div className="absolute text-8xl animate-truckRightToLeft">
              🚚
            </div>
          </div>

          {/* TEXT */}
          <h1 className="text-4xl font-extrabold text-green-600 drop-shadow-xl mb-2 animate-fadeIn">
            ORDER PLACED!
          </h1>

          <p className="text-xl text-black/90 animate-fadeIn delay-200">
            Truck is loading your items… 📦🚚
          </p>

          <p className="text-lg text-black/60 mt-3 animate-fadeIn delay-500">
            Redirecting to your orders page...
          </p>
        </div>

        {/* ANIMATIONS */}
        <style>{`
        /* TRUCK RIGHT → LEFT */
        @keyframes truckRightToLeft {
          0% { transform: translateX(250px); }    /* Enter from RIGHT */
          40% { transform: translateX(30px); }    /* Stop center */
          55% { transform: translateX(30px) rotate(-2deg); }  /* Shake loading */
          65% { transform: translateX(30px) rotate(2deg); }
          75% { transform: translateX(30px) rotate(0deg); }
          100% { transform: translateX(-350px); } /* Exit LEFT */
        }

        .animate-truckRightToLeft {
          animation: truckRightToLeft 3.2s ease-in-out forwards;
        }

        /* Fade In */
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
      `}</style>
        <Footer />
      </PageContainer>
    );
  }





  // MAIN CHECKOUT PAGE
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          CHECKOUT
        </h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-3xl font-semibold text-black mb-6">
              YOUR CART IS EMPTY
            </h2>
            <Link
              to="/buyer-dashboard/products"
              className="px-6 py-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* ADDRESS FORM */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-4 text-black">

              <h4 className="text-2xl font-bold mb-4">BILLING ADDRESS</h4>

              {/* ADDRESS SELECTOR BUTTONS */}
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleAddressTypeChange("HOME")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 ${selectedType === "HOME"
                    ? "backdrop-blur-xl bg-white/10 text-white border-white font-bold shadow-lg scale-105"
                    : "backdrop-blur-xl bg-white/10 text-black border-white/20 hover:bg-white/20"
                    }`}
                >
                  <FaHome /> HOME
                </button>
                <button
                  type="button"
                  onClick={() => handleAddressTypeChange("SECONDARY")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 ${selectedType === "SECONDARY"
                    ? "backdrop-blur-xl bg-white/10 text-white border-white font-bold shadow-lg scale-105"
                    : "backdrop-blur-xl bg-white/10 text-black border-white/20 hover:bg-white/20"
                    }`}
                >
                  <FaBuilding /> {savedAddresses.secondary?.type || "OFFICE/APT"}
                </button>
              </div>

              <input
                type="text"
                placeholder="FULL NAME"
                value={address.fullName}
                onChange={(e) =>
                  setAddress({ ...address, fullName: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                required
              />

              <input
                type="email"
                placeholder="EMAIL"
                value={address.email}
                onChange={(e) =>
                  setAddress({ ...address, email: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="PHONE NUMBER"
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                  required
                />
                <input
                  type="tel"
                  placeholder="ALTERNATE PHONE (OPTIONAL)"
                  value={address.alternatePhone}
                  onChange={(e) =>
                    setAddress({ ...address, alternatePhone: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                />
              </div>

              <input
                type="text"
                placeholder="STREET"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                required
              />

              <input
                type="text"
                placeholder="STREET 2 (OPTIONAL)"
                value={address.street2}
                onChange={(e) =>
                  setAddress({ ...address, street2: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="CITY"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                  required
                />
                <input
                  type="text"
                  placeholder="DISTRICT"
                  value={address.district}
                  onChange={(e) =>
                    setAddress({ ...address, district: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="STATE"
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                  required
                />
                <input
                  type="number"
                  placeholder="ZIP CODE"
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-black placeholder-gray-600"
                  required
                />
              </div>

              <select
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 text-black rounded-lg px-4 py-3"
              >
                <option value="India" className="text-black">
                  INDIA
                </option>
              </select>
            </div>

            {/* ORDER SUMMARY */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl h-fit text-black">
              <h2 className="text-2xl font-bold mb-6">ORDER SUMMARY</h2>

              <ul className="divide-y divide-gray-400 mb-6">
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium uppercase">{item.name}</p>
                      <p className="text-sm text-gray-700">
                        QTY: {item.qty} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>

              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>SHIPPING</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </li>
                <li className="flex justify-between font-bold text-lg border-t border-gray-400 pt-4">
                  <span>TOTAL</span>
                  <span>₹{total.toFixed(2)}</span>
                </li>
              </ul>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
              >
                {loading ? "PLACING ORDER..." : "PLACE ORDER (COD)"}
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </PageContainer>
  );
};

export default Checkout;
