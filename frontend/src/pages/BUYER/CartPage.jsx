import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaShoppingBasket,
  FaTag,
  FaWeightHanging,
  FaMoneyBillWave,
  FaCalculator,
  FaTruck,
  FaMoneyCheckAlt,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart, decQty } from "../../redux/action";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

const CartPage = () => {
  const cartItems = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Subtotal, shipping, total
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping = cartItems.length > 0 ? 30 : 0;
  const total = subtotal + shipping;

  // Handle checkout popup
  const handleCheckout = () => {
    setLoading(true);
    setShowSuccess(true);

    setTimeout(() => {
      setLoading(false);
      setShowSuccess(false);
      navigate("/buyer-dashboard/Checkout");
    }, 2500);
  };

  // Fix minus button logic
  const handleDecrease = (item) => {
    if (item.qty > 1) {
      dispatch(delCart(item));
    } else {
      dispatch(delCart(item));
    }
  };

  return (
    <PageContainer>
      <div className="pt-20 px-4 max-w-6xl mx-auto relative min-h-screen flex flex-col">

        {/* SUCCESS POPUP */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-[999] animate-fadeIn">
            <div className="bg-white/90 border border-white/20 rounded-3xl p-8 shadow-2xl text-center backdrop-blur-xl w-[90%] max-w-sm animate-scaleIn">
              <div className="text-5xl animate-bounce mb-4">🚚</div>

              <h2 className="text-3xl font-bold text-black mb-2">
                Processing Order...
              </h2>

              <p className="text-gray-600 text-sm">
                Please wait while we confirm your purchase.
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <h1 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
            My Cart
          </h1>
        </div>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <FaShoppingBasket className="text-6xl text-gray-200 mb-4" />
            <h2 className="text-4xl font-bold text-black drop-shadow mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-black mb-6">
              Looks like you haven't added anything yet.
            </p>

            <Link
              to="/buyer-dashboard/products"
              className="px-8 py-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer flex items-center gap-2"
            >
              <FaArrowLeft className="animate-pulse" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start pb-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6 flex items-center gap-2">
                Shopping Cart
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-white/10 last:border-0"
                  >
                    {/* Image + Title Row (Mobile) / Just Image (Desktop) */}
                    <div className="flex items-start gap-3 sm:gap-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg sm:rounded-xl border border-white/20 shadow flex-shrink-0"
                      />

                      {/* Mobile Only: Title and Price next to image */}
                      <div className="flex-1 sm:hidden">
                        <h3 className="text-base font-semibold text-black drop-shadow line-clamp-2 flex items-center gap-2">
                          <FaTag className="text-purple-900 text-sm" />
                          {item.name}
                        </h3>
                        <p className="text-black text-sm mt-1">
                          ₹{item.price.toFixed(2)} each
                        </p>
                        {item.weight && (
                          <p className="text-xs text-black mt-1">
                            Weight: {item.weight}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Product Details (Title, Price, Description, Controls) */}
                    <div className="hidden sm:flex sm:flex-1 sm:flex-col">
                      <h3 className="text-xl font-semibold text-black drop-shadow flex items-center gap-2">
                        <FaTag className="text-purple-900" />
                        {item.name}
                      </h3>
                      <p className="text-black text-sm">
                        ₹{item.price.toFixed(2)} each
                      </p>

                      {/* Description */}
                      {item.description && (
                        <p className="text-black text-sm mt-2 line-clamp-2 max-w-md">
                          {item.description}
                        </p>
                      )}

                      {item.weight && (
                        <p className="text-sm text-black mt-1">
                          <FaWeightHanging className="inline mr-1" />
                          Weight: {item.weight}
                        </p>
                      )}

                      {/* QTY CONTROLS - Desktop */}
                      <div className="flex items-center mt-4">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="
                            px-3 py-1 
                            text-black 
                            bg-white/20 border border-white/30 
                            rounded-l-md 
                            hover:bg-white/30 
                            transition
                          "
                        >
                          <FaMinus />
                        </button>

                        <span className="px-4 py-1 bg-white/10 text-black border border-white/20 font-bold">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => dispatch(addCart(item))}
                          className="
                            px-3 py-1 
                            text-black 
                            bg-white/20 border border-white/30 
                            rounded-r-md 
                            hover:bg-white/30 transition
                          "
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>

                    {/* Desktop: Price + Delete (separate column on right) */}
                    <div className="hidden sm:flex sm:flex-col sm:items-end sm:space-y-2 flex-shrink-0">
                      <div className="text-xl font-bold text-white">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </div>
                      <button
                        onClick={() => dispatch(delCart(item))}
                        className="text-red-500 hover:text-red-700 text-lg transition hover:rotate-12"
                        title="Remove Item"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Mobile Only: Description + Controls (full width below image/title) */}
                    <div className="sm:hidden w-full space-y-3">
                      {/* Description */}
                      {item.description && (
                        <p className="text-black text-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* QTY CONTROLS & PRICE - Mobile */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="
                              px-3 py-1.5 
                              text-black 
                              bg-white/20 border border-white/30 
                              rounded-l-md 
                              hover:bg-white/30 
                              transition
                            "
                          >
                            <FaMinus className="text-sm" />
                          </button>

                          <span className="px-4 py-1.5 bg-white/10 text-black border border-white/20 font-medium">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => dispatch(addCart(item))}
                            className="
                              px-3 py-1.5 
                              text-black 
                              bg-white/20 border border-white/30 
                              rounded-r-md 
                              hover:bg-white/30 transition
                            "
                          >
                            <FaPlus className="text-sm" />
                          </button>
                        </div>

                        {/* PRICE - Mobile */}
                        <div className="text-lg font-bold text-white">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>

                      {/* Delete Button - Mobile */}
                      <button
                        onClick={() => dispatch(delCart(item))}
                        className="w-full py-2 text-red-500 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50/10 transition flex items-center justify-center gap-2"
                      >
                        <FaTrash /> Remove Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl h-fit lg:sticky lg:top-24">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6 flex items-center gap-2">
                Order Summary
              </h2>

              <ul className="space-y-3 sm:space-y-4 text-black text-base sm:text-lg">
                <li className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    Subtotal
                  </span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </li>

                <li className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    Shipping
                  </span>
                  <span className="font-semibold">₹{shipping.toFixed(2)}</span>
                </li>

                <li className="flex justify-between border-t border-white/20 pt-3 sm:pt-4 text-xl sm:text-2xl font-bold text-black">
                  <span className="flex items-center gap-2">
                    <FaMoneyCheckAlt className="text-white" /> Total
                  </span>
                  <span>₹{total.toFixed(2)}</span>
                </li>
              </ul>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={loading ? null : handleCheckout}
                disabled={loading}
                className="mt-4 sm:mt-6 block w-full text-center py-2.5 sm:py-3 border border-white/40 text-white text-base sm:text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="white"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    Proceed to Checkout <FaArrowLeft className="rotate-180" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </PageContainer>
  );
};

export default CartPage;
