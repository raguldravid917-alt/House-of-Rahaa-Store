import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import { useWishlist } from "../context/wishlist";
import { useSound } from "../context/sound"; // 🔊 Sound Hook
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard"; // Reusing 3D Card

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cart, setCart] = useCart();
  const [wishlist, setWishlist, toggleWishlist] = useWishlist();
  const { playSound } = useSound(); // 🔊 Hook
  
  // Zoom State
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  // --- 🖼️ IMAGE HELPER ---
  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/800x1000?text=Artifact";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/"); // High Res for Zoom
    }
    return url;
  };

  useEffect(() => {
    if (params.slug) getProduct();
  }, [params.slug]);

  // --- FETCH PRODUCT ---
  const getProduct = async () => {
    try {
      const { data } = await axios.get(`https://house-of-rahaa-store.onrender.com/api/v1/product/get-product/${params.slug}`);
      setProduct(data?.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);
    } catch (error) {
      console.log(error);
    }
  };

  // --- FETCH SIMILAR ---
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(`https://house-of-rahaa-store.onrender.com/api/v1/product/related-product/${pid}/${cid}`);
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  // --- 🔍 QUANTUM ZOOM LOGIC ---
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${transformImage(product.image)})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#d4a373] selection:text-black relative overflow-x-hidden">
      
      {/* 🌌 DEEP SPACE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-[#d4a373]/5 rounded-full blur-[200px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
          <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 🔙 NAVIGATION */}
      <nav className="fixed top-8 left-8 z-50">
          <button 
            onClick={() => { playSound("click"); navigate(-1); }}
            className="group flex items-center gap-3 text-white/50 hover:text-[#d4a373] transition-all"
          >
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#d4a373] transition-all bg-black/20 backdrop-blur-md">
                  ←
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Return</span>
          </button>
      </nav>

      {/* 🧪 HOLOGRAPHIC LAB (Main Content) */}
      <div className="relative z-10 max-w-7xl mx-auto pt-32 px-6 lg:px-12 pb-40">
          
          <div className="flex flex-col lg:flex-row gap-16 items-start">
              
              {/* 📸 LEFT: IMAGE (With Quantum Zoom) */}
              <div className="w-full lg:w-1/2 relative group">
                  <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] bg-[#0a0a0a]">
                      
                      {/* Main Image */}
                      <img 
                        src={transformImage(product.image)} 
                        alt={product.name} 
                        className="w-full h-full object-cover opacity-90 transition-opacity"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onMouseEnter={() => playSound("hover")} // 🔊 Sound
                      />

                      {/* Quantum Zoom Overlay (The Lens) */}
                      <div 
                        className="absolute inset-0 pointer-events-none z-20 hidden lg:block"
                        style={{
                            ...zoomStyle,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "250%", // Zoom Level
                            mixBlendMode: "normal"
                        }}
                      ></div>
                      
                      {/* Decorative Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                      
                      {/* Tags */}
                      <div className="absolute bottom-8 left-8 flex gap-3">
                          <span className="px-4 py-1.5 rounded-full border border-[#d4a373]/30 bg-[#d4a373]/10 text-[#d4a373] text-[9px] uppercase tracking-widest backdrop-blur-md">
                              {product.category?.name || "Artifact"}
                          </span>
                          {product.quantity < 5 && (
                              <span className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[9px] uppercase tracking-widest backdrop-blur-md animate-pulse">
                                  Critical Stock
                              </span>
                          )}
                      </div>
                  </div>
              </div>

              {/* 📝 RIGHT: SPECS (Details) */}
              <div className="w-full lg:w-1/2 space-y-10 lg:sticky lg:top-32">
                  
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-700">
                      <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Artifact Protocol: {product._id?.slice(-6).toUpperCase()}</p>
                      <h1 className="text-5xl md:text-7xl font-serif italic text-white leading-none">{product.name}</h1>
                      <p className="text-4xl font-mono text-[#d4a373] tracking-tight">₹{product.price?.toLocaleString()}</p>
                  </div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-[#d4a373]/50 to-transparent"></div>

                  <p className="text-gray-400 leading-relaxed font-light text-sm tracking-wide border-l border-white/10 pl-6">
                      {product.description}
                  </p>

                  {/* 🎮 ACTION DECK */}
                  <div className="flex gap-4 pt-4">
                      {/* ADD TO BAG */}
                      <button 
                        onClick={() => {
                            playSound("success"); // 🔊 Sound
                            setCart([...cart, product]);
                            localStorage.setItem('cart', JSON.stringify([...cart, product]));
                            toast.success("Artifact Acquired");
                        }}
                        className="flex-1 py-6 bg-white text-black rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#d4a373] transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_#d4a373] hover:scale-[1.02]"
                      >
                        Acquire Artifact
                      </button>

                      {/* VAULT */}
                      <button 
                        onClick={() => {
                            playSound("click"); // 🔊 Sound
                            toggleWishlist(product);
                        }}
                        className="w-20 rounded-[20px] border border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-white transition-all text-2xl"
                        title="Secure in Vault"
                      >
                         {wishlist.some(p => p._id === product._id) ? "★" : "☆"}
                      </button>
                  </div>
                  
                  {/* Shipping Info */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5 text-center">
                          <span className="block text-xl mb-1">🚚</span>
                          <span className="text-[8px] uppercase tracking-widest text-white/50">Global Shipping</span>
                      </div>
                      <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5 text-center">
                          <span className="block text-xl mb-1">🛡️</span>
                          <span className="text-[8px] uppercase tracking-widest text-white/50">Auth Verified</span>
                      </div>
                  </div>

              </div>
          </div>

          {/* 🧬 SIMILAR ARTIFACTS */}
          <div className="mt-40 border-t border-white/5 pt-20">
              <h3 className="text-3xl font-serif italic text-white mb-12 text-center">Related Artifacts</h3>
              
              {relatedProducts.length < 1 ? (
                  <p className="text-center text-white/30 text-xs uppercase tracking-widest">No related data found in archive.</p>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {relatedProducts.map((p) => (
                          <ProductCard key={p._id} p={p} openQuickView={() => {}} />
                      ))}
                  </div>
              )}
          </div>

      </div>

    </div>
  );
};

export default ProductDetails;