import React, { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const Cart = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();

  // Loading state
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const addItem = (product) => dispatch(addCart(product));
  const removeItem = (product) => dispatch(delCart(product));

  // EMPTY CART
  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h4 className="text-4xl font-bold text-black drop-shadow mb-4">
        Your Cart is Empty
      </h4>
      <p className="text-black mb-6">
        Looks like you haven’t added anything yet.
      </p>
      <Link
        to="/product"
        className="px-8 py-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
      >
        <i className="fa fa-arrow-left mr-2"></i> Continue Shopping
      </Link>
    </div>
  );

  // CART DISPLAY
  const ShowCart = () => {
    let subtotal = 0;
    let shipping = 30;
    let totalQty = 0;

    state.forEach((item) => {
      subtotal += item.price * item.qty;
      totalQty += item.qty;
    });

    return (
      <section className="min-h-[80vh] py-6 sm:py-8 md:py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

            {/* CART ITEMS */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">Shopping Cart</h2>

              <div className="space-y-4 sm:space-y-6">
                {state.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-white/10"
                  >
                    {/* Image + Title Row (Mobile) / Just Image (Desktop) */}
                    <div className="flex items-start gap-3 sm:gap-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg sm:rounded-xl border border-white/20 shadow flex-shrink-0"
                      />

                      {/* Mobile: Title and Price (next to image) */}
                      <div className="flex-1 sm:hidden">
                        <h3 className="text-base font-semibold text-black drop-shadow line-clamp-2">
                          {item.title || item.name}
                        </h3>
                        <p className="text-black text-sm mt-1">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {/* Desktop: Product Details (Title, Price, Description, Controls) */}
                    <div className="hidden sm:flex sm:flex-1 sm:flex-col">
                      <h3 className="text-xl font-semibold text-black drop-shadow">
                        {item.title || item.name}
                      </h3>
                      <p className="text-black text-sm">
                        ₹{item.price.toFixed(2)} each
                      </p>

                      {/* Description */}
                      <p className="text-black text-sm mt-2 line-clamp-2 max-w-md">
                        {item.description}
                      </p>

                      {/* QTY CONTROLS - Desktop */}
                      <div className="flex items-center mt-4">
                        <button
                          onClick={() => removeItem(item)}
                          className="
                            px-3 py-1 
                            text-black 
                            bg-white/20 border border-white/30 
                            rounded-l-md 
                            hover:bg-white/30 
                            transition
                          "
                        >
                          <i className="fas fa-minus"></i>
                        </button>

                        <span className="px-4 py-1 bg-white/10 text-black border border-white/20">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => addItem(item)}
                          className="
                            px-3 py-1 
                            text-black 
                            bg-white/20 border border-white/30 
                            rounded-r-md 
                            hover:bg-white/30 transition
                          "
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    {/* Desktop: Price (separate column on right) */}
                    <div className="hidden sm:block text-xl font-bold text-white flex-shrink-0">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </div>

                    {/* Mobile Only: Description + Controls (full width below image/title) */}
                    <div className="sm:hidden w-full space-y-3">
                      {/* Description */}
                      <p className="text-black text-sm leading-relaxed">
                        {item.description}
                      </p>

                      {/* QTY CONTROLS & PRICE - Mobile */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => removeItem(item)}
                            className="
                              px-3 py-1.5 
                              text-black 
                              bg-white/20 border border-white/30 
                              rounded-l-md 
                              hover:bg-white/30 
                              transition
                            "
                          >
                            <i className="fas fa-minus text-sm"></i>
                          </button>

                          <span className="px-4 py-1.5 bg-white/10 text-black border border-white/20 font-medium">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => addItem(item)}
                            className="
                              px-3 py-1.5 
                              text-black 
                              bg-white/20 border border-white/30 
                              rounded-r-md 
                              hover:bg-white/30 transition
                            "
                          >
                            <i className="fas fa-plus text-sm"></i>
                          </button>
                        </div>

                        {/* PRICE - Mobile */}
                        <div className="text-lg font-bold text-white">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl h-fit lg:sticky lg:top-24">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">
                Order Summary
              </h2>

              <ul className="space-y-3 sm:space-y-4 text-black text-base sm:text-lg">
                <li className="flex justify-between">
                  <span>Products ({totalQty})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </li>

                <li className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </li>

                <li className="flex justify-between border-t border-white/20 pt-3 sm:pt-4 text-xl sm:text-2xl font-bold text-black">
                  <span>Total</span>
                  <span>₹{(subtotal + shipping).toFixed(2)}</span>
                </li>
              </ul>

              <Link
                to="/buyer-dashboard/Checkout"
                className="mt-4 sm:mt-6 block w-full text-center py-2.5 sm:py-3 border border-white/40 text-white text-base sm:text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
              >
                Proceed to Checkout
              </Link>
            </div>

          </div>
        </div>
      </section>
    );
  };

  return (
    <PageContainer>
      <div className="pt-16 sm:pt-20 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
          Cart
        </h1>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-14 h-14 border-4 border-white/40 border-t-[#8FE3A2] rounded-full animate-spin"></div>
          </div>
        ) : state.length === 0 ? (
          <EmptyCart />
        ) : (
          <ShowCart />
        )}
      </div>
      <Footer />
    </PageContainer>
  );
};

export default Cart;
