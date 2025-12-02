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
          <div className="grid md:grid-cols-3 gap-10 pb-10">
            {/* Cart Items */}
            <div className="md:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-2">
                Shopping Cart
              </h2>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200 last:border-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-cover bg-white rounded-xl border border-gray-200 p-1 shadow-md hover:scale-105 transition-transform"
                    />

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-black flex items-center justify-center sm:justify-start gap-2">
                        <FaTag className="text-purple-900 " />
                        {item.name}
                      </h3>

                      {/* Product Description */}
                      {item.description && (
                        <p className="text-sm text-black mt-1 flex items-center justify-center sm:justify-start gap-1">
                          {item.description.substring(0, 60)}...
                        </p>
                      )}

                      {item.weight && (
                        <p className="text-sm text-black mt-1 flex items-center justify-center sm:justify-start gap-1">
                          Weight: {item.weight}
                        </p>
                      )}

                      <p className="text-black font-bold text-lg mt-1 flex items-center justify-center sm:justify-start gap-1">
                        ₹{item.price.toFixed(2)} each
                      </p>

                      <div className="flex items-center justify-center sm:justify-start mt-4">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="
                            px-3 py-1 text-black 
                            bg-gray-200 border border-gray-300 
                            rounded-l-md hover:bg-gray-300 transition shadow-sm
                          "
                        >
                          <FaMinus />
                        </button>

                        <span className="px-4 py-1 bg-white text-black border-t border-b border-gray-300 font-bold">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => dispatch(addCart(item))}
                          className="
                            px-3 py-1 text-black 
                            bg-gray-200 border border-gray-300 
                            rounded-r-md hover:bg-gray-300 transition shadow-sm
                          "
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end space-y-2">
                      <div className="text-xl font-bold text-black flex items-center gap-1">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </div>

                      <button
                        onClick={() => dispatch(delCart(item))}
                        className="text-red-700 hover:text-red-900 text-lg transition hover:rotate-12"
                        title="Remove Item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl h-max">
              <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-2">
                Order Summary
              </h2>

              <ul className="space-y-4 text-black text-lg">
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

                <li className="flex justify-between border-t border-gray-300 pt-4 text-2xl font-bold text-black">
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
                className="mt-6 block w-full text-center border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
