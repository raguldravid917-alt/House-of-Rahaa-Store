import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useCart } from "../context/cart";
import { useWishlist } from "../context/wishlist"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth"; 
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard"; 

const Home = () => {
  const [auth, setAuth] = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [cart, setCart] = useCart();
  const [wishlist] = useWishlist();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [showNav, setShowNav] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null); // 🔥 Quick View state
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  // --- 🏛️ ARCHIVE DATA PROTOCOLS ---
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("https://house-of-rahaa-store.onrender.com/api/v1/category/get-category");
      if (data?.success) setCategories(data.category);
    } catch (err) { console.error("Archive Fetch Error", err); }
  };

  const getProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("https://house-of-rahaa-store.onrender.com/api/v1/product/get-product");
      if (data?.success) setProducts(data.products);
    } catch (error) { toast.error("Vault Connection Severed"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    getProducts();
    getAllCategories();
    window.scrollTo(0, 0);

    const controlNavbar = () => {
      if (window.scrollY > 80) {
        setShowNav(window.scrollY < lastScrollY.current);
      } else { setShowNav(true); }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  // --- 🔐 IDENTITY ACTIONS ---
  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Identity De-authenticated");
    navigate("/login");
  };

  // Image Transformation helper
  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/400x500?text=No+Visual";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
    }
    return url;
  };

  // --- 🔍 FILTER PROTOCOL ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === "All" || (p.category?.name || p.category) === selectedCat;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCat]);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[#d4a373] selection:text-black overflow-x-hidden font-sans">
      
      {/* 🌌 DYNAMIC ETHER BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] bg-gradient-to-br from-[#d4a373]/5 via-transparent to-purple-900/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 🛸 AERODYNAMIC NAVIGATOR */}
      <nav className={`fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-[1200px] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${showNav ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"}`}>
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full px-5 md:px-10 py-3 md:py-4 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-2 h-2 rounded-full bg-[#d4a373] shadow-[0_0_15px_#d4a373]"></div>
            <h1 className="text-xl md:text-3xl font-serif italic tracking-tighter">Rahaa</h1>
          </div>

          <div className="flex items-center gap-3 md:gap-7">
            <button onClick={() => navigate("/vault")} className="relative p-2 text-white/50 hover:text-[#d4a373] transition-all"><span className="text-xl md:text-2xl">★</span></button>
            <button onClick={() => navigate("/cart")} className="relative p-2 text-white/50 hover:text-white transition-all"><span className="text-xl md:text-2xl">👜</span>{cart?.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}</button>

            {auth?.token ? (
              <div className="flex items-center gap-3 md:gap-6 border-l border-white/10 pl-3 md:pl-6">
                <button onClick={() => navigate("/dashboard/user/orders")} className="hidden sm:block text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/30 hover:text-[#d4a373]">Orders</button>
                <div onClick={() => navigate(`/dashboard/${auth?.user?.role === 1 ? 'admin':'user'}`)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#d4a373] to-white/20 p-[1px] cursor-pointer"><div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] md:text-[12px] font-black text-[#d4a373] uppercase">{auth.user?.name?.charAt(0)}</div></div>
                <button onClick={handleLogout} className="text-white/20 hover:text-red-500 transition-colors text-sm md:text-lg">✕</button>
              </div>
            ) : (
              <button onClick={() => navigate("/login")} className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-[#d4a373] border border-[#d4a373]/30 px-5 py-2 rounded-full hover:bg-[#d4a373] hover:text-black transition-all">Identify</button>
            )}
          </div>
        </div>
      </nav>

      {/* 🎬 DYNAMIC EXHIBITION HEADER */}
      <header className="relative pt-40 md:pt-60 pb-20 px-6 text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full select-none pointer-events-none opacity-[0.03]"><h2 className="text-[25vw] font-black italic tracking-tighter">COLLECTION</h2></div>
        <div className="relative z-10 space-y-6 md:space-y-10">
           <div className="inline-block px-6 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-xl"><p className="text-[9px] md:text-[11px] uppercase tracking-[0.6em] text-[#d4a373] font-black">Archive Epoch • 2026</p></div>
           <h2 className="text-5xl md:text-[9rem] font-serif italic tracking-tighter leading-[0.9]">Masterpiece <br/> Inventory</h2>
           <div className="flex gap-4 p-1.5 bg-white/[0.03] border border-white/5 rounded-full overflow-x-auto no-scrollbar max-w-[95vw] mx-auto mt-16">
              <button onClick={() => setSelectedCat("All")} className={`px-10 py-3.5 rounded-full text-[10px] uppercase tracking-[0.4em] font-black transition-all ${selectedCat === "All" ? "bg-white text-black shadow-xl":"text-white/30"}`}>All</button>
              {categories.map((c) => (<button key={c._id} onClick={() => setSelectedCat(c.name)} className={`px-10 py-3.5 rounded-full text-[10px] uppercase tracking-[0.4em] font-black whitespace-nowrap transition-all ${selectedCat === c.name ? "bg-white text-black":"text-white/30 hover:text-white"}`}>{c.name}</button>))}
           </div>
        </div>
      </header>

      {/* 🏛️ GALLERY GRID */}
      <main className="max-w-[1700px] mx-auto px-4 md:px-16 pb-40 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-6"><div className="w-10 h-10 border-t border-[#d4a373] rounded-full animate-spin"></div><p className="text-[9px] tracking-[1em] text-white/20 uppercase font-black font-mono">Syncing Registry</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-12 gap-y-20 md:gap-y-32">
            {filteredProducts.map((p, idx) => (
              <div key={p._id} className="relative group">
                <span className="absolute -top-12 -left-4 text-[10rem] font-serif italic text-white/[0.02] select-none pointer-events-none group-hover:text-[#d4a373]/5 transition-colors">0{idx + 1}</span>
                <ProductCard p={p} openQuickView={setActiveProduct} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 📽️ CINEMATIC QUICK VIEW MODAL (🔥 FIXED EYE ICON ACTION) */}
      {activeProduct && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveProduct(null)}></div>
          <div className="relative w-full max-w-6xl bg-[#080808] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-20 duration-700 shadow-[0_100px_100px_rgba(0,0,0,0.9)]">
            <button onClick={() => setActiveProduct(null)} className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#d4a373] hover:text-black transition-all">✕</button>
            <div className="w-full md:w-1/2 h-[40vh] md:h-auto overflow-hidden">
               <img src={transformImage(activeProduct.image)} alt={activeProduct.name} className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110" />
            </div>
            <div className="p-8 md:p-16 flex-1 flex flex-col justify-center space-y-8">
               <div className="space-y-2">
                  <p className="text-[#d4a373] text-[10px] uppercase tracking-[0.5em] font-black">{activeProduct.category?.name}</p>
                  <h3 className="text-4xl md:text-6xl font-serif italic leading-none">{activeProduct.name}</h3>
                  <p className="text-3xl font-mono text-white/50 tracking-tighter">₹{activeProduct.price?.toLocaleString()}</p>
               </div>
               <p className="text-white/40 text-sm leading-relaxed font-light italic border-l border-white/10 pl-6">{activeProduct.description}</p>
               <div className="flex gap-4 pt-4">
                  <button onClick={() => { setCart([...cart, activeProduct]); localStorage.setItem('cart', JSON.stringify([...cart, activeProduct])); toast.success("Acquired Artifact"); setActiveProduct(null); }} className="flex-1 py-5 bg-white text-black text-[11px] uppercase font-black rounded-full hover:bg-[#d4a373] transition-all active:scale-95">Secure Acquisition</button>
                  <button onClick={() => navigate(`/product/${activeProduct.slug}`)} className="px-10 py-5 border border-white/10 text-[11px] uppercase font-black rounded-full hover:bg-white/5 transition-all">Details</button>
               </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-40 text-center border-t border-white/5 opacity-20"><p className="text-[10px] tracking-[1.5em] uppercase font-black">House of Rahaa • Global Archive</p></footer>
    </div>
  );
};

export default Home;