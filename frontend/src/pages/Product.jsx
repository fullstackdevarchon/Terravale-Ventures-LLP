import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { FaStar, FaShoppingCart, FaCreditCard, FaWeightHanging, FaBoxes } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import API_BASE from "../config";

// ✅ Import Navbar & Footer
import PageContainer from "../components/PageContainer";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    const productDetails = {
      id: product._id || product.id,
      name: product.name || product.title,
      price: product.price,
      weight: product.weight || "",
      image: product.image?.url || product.image || "",
      description: product.description,
      qty: 1,
    };
    dispatch(addCart(productDetails));
    toast.success("Added to cart!");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/v1/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);

          // Fetch similar products by category
          if (res.data.product.category) {
            setLoading2(true);
            const categoryRes = await axios.get(`${API_BASE}/api/v1/products/buyer`);
            if (categoryRes.data.success) {
              const related = categoryRes.data.products.filter(
                (item) =>
                  item.category?._id === res.data.product.category._id &&
                  item._id !== res.data.product._id
              ).slice(0, 8); // Limit to 8 similar products
              setSimilarProducts(related);
            }
            setLoading2(false);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // 🔄 Skeleton Loader for Main Product
  const Loading = () => (
    <div className="flex flex-col md:flex-row gap-8 animate-pulse mt-12">
      <div className="w-full md:w-1/2 h-96 bg-black/20 rounded-lg" />
      <div className="flex-1 space-y-4">
        <div className="h-6 w-40 bg-black/20 rounded"></div>
        <div className="h-10 w-3/4 bg-black/20 rounded"></div>
        <div className="h-6 w-24 bg-black/20 rounded"></div>
        <div className="h-8 w-32 bg-black/20 rounded"></div>
        <div className="h-20 bg-black/20 rounded"></div>
      </div>
    </div>
  );

  // ✅ Show Main Product
  const ShowProduct = () => {
    if (!product) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-black">Product not found</h2>
          <Link to="/product" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to Products
          </Link>
        </div>
      );
    }

    return (
      <div className="backdrop-blur-xl bg-black/10 border border-black/20 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="w-full h-64 md:h-80 flex items-center justify-center overflow-hidden rounded-xl shadow-2xl bg-black border-2 border-black/30">
              <img
                className="w-full h-full object-cover"
                src={product.image?.url || product.image}
                alt={product.name || "Product"}
                loading="lazy"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-center text-black">
            <p className="uppercase text-green-300 tracking-wide mb-2 font-semibold text-sm">
              {product.category?.name || product.category}
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-black">
              {product.name || product.title}
            </h1>

            {product.rating && (
              <p className="flex items-center text-yellow-300 mb-4 text-base md:text-lg">
                <FaStar className="mr-2" />
                {product.rating?.rate || product.rating} / 5
              </p>
            )}

            <div className="mb-6 bg-black/20 backdrop-blur-sm border border-black/30 rounded-xl p-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black">₹{product.price}</h2>
              {product.weight && (
                <p className="text-sm text-gray-200 mt-2 flex items-center gap-2">
                  <FaWeightHanging /> {product.weight}
                </p>
              )}
              {product.quantity !== undefined && (
                <p className="text-sm text-gray-200 mt-1 flex items-center gap-2">
                  <FaBoxes /> Stock: {product.quantity} available
                </p>
              )}
            </div>

            <p className="text-gray-100 text-sm md:text-base mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                className="px-6 py-3 border border-black/40 text-black text-base md:text-lg rounded-md bg-black/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer flex items-center justify-center gap-2"
                onClick={() => addProduct(product)}
                disabled={product.quantity === 0}
              >
                <FaShoppingCart /> {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <Link
                to="/cart"
                className="px-6 py-3 border border-black/40 text-black text-base md:text-lg rounded-md bg-black/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer text-center flex items-center justify-center"
              >
                Go to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔄 Skeleton Loader for Similar Products
  const Loading2 = () => (
    <div className="flex gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="w-64 h-80 bg-black/20 rounded-lg animate-pulse flex-shrink-0"
        />
      ))}
    </div>
  );

  // ✅ Show Similar Products
  const ShowSimilarProduct = () => {
    if (similarProducts.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-black">No similar products found</p>
        </div>
      );
    }

    return (
      <div className="flex gap-6 py-6">
        {similarProducts.map((item) => (
          <div
            key={item._id || item.id}
            className="bg-black/10 backdrop-blur-xl border border-black/20 rounded-xl shadow-md hover:shadow-2xl transition overflow-hidden relative flex flex-col w-64 group flex-shrink-0"
          >
            {/* Image */}
            <div className="flex justify-center bg-black/5 p-2">
              <div className="w-32 h-32 flex items-center justify-center overflow-hidden rounded-md">
                <img
                  src={item.image?.url || item.image}
                  alt={item.name || item.title || "Similar product"}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Info */}
            <div className="p-2 flex-1 flex flex-col justify-between">
              <h3 className="font-semibold text-black mb-2 line-clamp-2">
                {item.name || item.title}
              </h3>
              <div className="mb-4">
                <p className="text-lg font-bold text-black">₹{item.price}</p>
                {item.weight && (
                  <p className="text-sm text-gray-300 mt-1">{item.weight}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to={`/product/${item._id || item.id}`}
                  className="px-4 py-2 text-center border border-black/40 text-black text-sm rounded-md bg-black/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
                >
                  <FaCreditCard className="inline mr-2" /> View Details
                </Link>
                <button
                  onClick={() => addProduct(item)}
                  className="px-4 py-2 text-center border border-black/40 text-black text-sm rounded-md bg-black/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer"
                  disabled={item.quantity === 0}
                >
                  <FaShoppingCart className="inline mr-2" />
                  {item.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageContainer>
      <section className="container mx-auto px-4 py-8 md:py-12 mt-16">
        {loading ? <Loading /> : <ShowProduct />}

        {!loading && similarProducts.length > 0 && (
          <div className="mt-16">
            {/* <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">You may also like</h2>
            <Marquee pauseOnHover={true} pauseOnClick={true} speed={50}>
              {loading2 ? <Loading2 /> : <ShowSimilarProduct />}
            </Marquee> */}
          </div>
        )}
      </section>
    </PageContainer>
  );
};

export default Product;
