import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { useDispatch } from "react-redux";
import { addCart } from "../../redux/action";
import { FaStar, FaShoppingCart, FaCreditCard, FaTag, FaWeightHanging } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import PageContainer from "../../components/PageContainer";
import Footer from "./Footer";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart({
      id: product._id,
      name: product.name,
      price: product.price,
      weight: product.weight,
      image: product.image?.url || "",
      description: product.description,
      qty: 1,
    }));
    toast.success("Added to cart!");
  };

  // Fetch main product
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/v1/products/${id}`)
      .then(res => {
        if (res.data.success) {
          setProduct(res.data.product);
        }
      })
      .catch(err => {
        console.error("❌ Product fetch error:", err);
        toast.error("Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch similar products
  useEffect(() => {
    if (!product?.category) return;
    setLoadingSimilar(true);
    axios.get(`http://localhost:5000/api/v1/products/similar/${product.category._id}/${product._id}`)
      .then(res => {
        if (res.data.success) setSimilarProducts(res.data.products);
      })
      .catch(err => console.error("❌ Similar products fetch error:", err))
      .finally(() => setLoadingSimilar(false));
  }, [product]);

  // Loading skeletons
  const Loading = () => (
    <div className="flex flex-col md:flex-row gap-8 animate-pulse mt-12">
      <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded-lg" />
      <div className="flex-1 space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded"></div>
        <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const ShowProduct = () => (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row gap-12 mt-12 animate-fadeIn">
      <div className="w-full md:w-1/2 flex justify-center items-center">
        {product?.image?.url ? (
          <div className="w-full max-w-md aspect-square flex items-center justify-center overflow-hidden rounded-2xl shadow-lg bg-white/50 border border-white/30 group">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={product.image.url}
              alt={product.name}
              loading="lazy"
            />
          </div>
        ) : <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />}
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FaTag className="text-purple-600 animate-pulse" />
            <p className="uppercase text-black tracking-wide font-semibold">{product?.category?.name}</p>
          </div>
          <h1 className="text-4xl font-extrabold text-black drop-shadow-sm">{product?.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
            <span className="font-bold text-yellow-700 mr-2">{product?.rating || "4.5"}</span>
            <FaStar className="text-yellow-500 animate-spin-slow" />
          </div>
          <div className="flex items-center bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            <FaWeightHanging className="text-teal-600 mr-2 animate-bounce" />
            <span className="font-medium text-teal-800">{product?.weight}</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-black">
          ₹ {product?.price}
        </h2>

        <p className="text-black/80 leading-relaxed text-lg border-l-4 border-white pl-4">
          {product?.description}
        </p>

        <div className="flex gap-4 pt-4">
          <button
            className="px-8 py-4 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer flex items-center gap-3 group"
            onClick={() => addProduct(product)}
          >
            <FaShoppingCart className="group-hover:rotate-12 transition-transform" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <section className="container mx-auto px-4 py-12">
        {loading ? <Loading /> : <ShowProduct />}
      </section>
      <Footer />
    </PageContainer>
  );
};

export default Product;
