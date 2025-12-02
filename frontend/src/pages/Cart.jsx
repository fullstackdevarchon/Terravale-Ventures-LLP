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
      <section className="min-h-[80vh] py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid md:grid-cols-3 gap-8">

            {/* CART ITEMS */}
            <div className="md:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-3xl font-bold text-black mb-6">Shopping Cart</h2>

              <div className="space-y-6">
                {state.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-6 pb-6 border-b border-white/10"
                  >
                    {/* IMAGE */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-28 h-28 object-cover rounded-xl border border-white/20 shadow"
                    />

                    {/* PRODUCT DETAILS */}
                    <div className="flex-1">
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

                      {/* QTY CONTROLS */}
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

                    {/* PRICE */}
                    <div className="text-xl font-bold text-black">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-3xl font-bold text-black mb-6">
                Order Summary
              </h2>

              <ul className="space-y-4 text-black text-lg">
                <li className="flex justify-between">
                  <span>Products ({totalQty})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </li>

                <li className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </li>

                <li className="flex justify-between border-t border-white/20 pt-4 text-2xl font-bold text-black">
                  <span>Total</span>
                  <span>₹{(subtotal + shipping).toFixed(2)}</span>
                </li>
              </ul>

              <Link
                to="/buyer-dashboard/Checkout"
                className="mt-6 block w-full text-center py-2.5 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
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
      <div className="pt-20 px-4">
        <h1 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
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
