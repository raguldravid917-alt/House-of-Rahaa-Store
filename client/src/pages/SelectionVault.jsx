import React from "react";
import { useWishlist } from "../context/wishlist";
import { useCart } from "../context/cart";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SelectionVault = () => {
  const [wishlist, setWishlist, toggleWishlist] = useWishlist();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();

  // --- 🖼️ IMAGE OPTIMIZER ---
  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/400x500?text=No+Visual";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
    }
    return url;
  };

  // --- ❌ REMOVE ITEM (DB SYNCED) ---
  const removeItem = async (product) => {
    try {
      // ✅ Context-ல் உள்ள toggleWishlist-ஐ அழைத்தால் அது DB-யிலும் நீக்கிவிடும்
      await toggleWishlist(product);
    } catch (error) {
      console.error("Vault Removal Error:", error);
    }
  };

  // --- 🛍️ MOVE TO CART ---
  const moveToCart = (p) => {
    const exists = cart.find((item) => item._id === p._id);
    if (exists) {
      toast.error("Already in Bag");
      return;
    }
    
    // 1. Add to Cart
    const updatedCart = [...cart, p];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    // 2. Remove from Vault (Syncs with DB)
    removeItem(p); 
    
    toast.success("Artifact moved to Bag");
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-white selection:text-black pb-40">
      
      {/* 🌌 1. DEEP SPACE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[20%] w-[600px] h-[600px] bg-[#d4a373]/5 rounded-full blur-[200px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 🔒 2. CINEMATIC HEADER */}
      <div className="relative pt-32 pb-20 text-center z-10 animate-in fade-in slide-in-from-top-10 duration-1000">
        <h1 className="text-[12vw] md:text-[8rem] font-serif italic text-white/5 leading-none absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap blur-[1px] select-none">
            ENCRYPTED
        </h1>
        <div className="relative z-10 mt-8">
            <p className="text-[#d4a373] tracking-[1em] text-[9px] uppercase font-bold mb-4 animate-pulse">
                Level 1 Clearance
            </p>
            <h2 className="text-4xl md:text-6xl font-light text-white tracking-wide">
                The Vault
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <div className={`w-2 h-2 rounded-full ${wishlist?.length > 0 ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></div>
                <span className="text-[9px] uppercase tracking-widest text-white/60">
                    {wishlist?.length || 0} Artifacts Secured
                </span>
            </div>
        </div>
      </div>

      {/* 📦 3. THE GRID */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {!wishlist || wishlist.length === 0 ? (
           // --- EMPTY STATE (Holographic Void) ---
           <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-6">
              <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[#d4a373]/10 rounded-full animate-ping"></div>
                  <span className="text-3xl text-white/20 font-serif italic">∅</span>
              </div>
              <p className="font-mono text-xs text-white/40 tracking-widest uppercase">System Empty.</p>
              <button 
                onClick={() => navigate("/")} 
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase tracking-[0.3em] hover:bg-[#d4a373] hover:text-black transition-all hover:scale-105"
              >
                Acquire Artifacts
              </button>
           </div>
        ) : (
           // --- PRODUCT GRID ---
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {wishlist.map((p) => (
                 <div key={p._id} className="group relative">
                    
                    {/* 1. GLASS CARD CONTAINER */}
                    <div 
                        className="relative aspect-[3/4] bg-[#0a0a0a] rounded-[20px] overflow-hidden border border-white/10 shadow-2xl group-hover:border-[#d4a373]/50 transition-all duration-500 cursor-pointer"
                        onClick={() => navigate(`/product/${p.slug}`)}
                    >
                        {/* Image */}
                        <img 
                            src={transformImage(p.image)} 
                            alt={p.name} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]" 
                        />
                        
                        {/* Dark Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

                        {/* ❌ REMOVE BUTTON (Top Right) */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeItem(p); }}
                            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/50 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 hover:border-red-500 transition-all duration-300 active:scale-90"
                            title="Purge Item"
                        >
                            ✕
                        </button>

                        {/* INFO & ACTIONS (Bottom) */}
                        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            
                            <p className="text-[#d4a373] text-[9px] uppercase tracking-widest mb-1">
                                {p.category?.name || "Artifact"}
                            </p>
                            <h3 className="font-serif text-2xl text-white italic mb-1">{p.name}</h3>
                            <p className="font-mono text-sm text-white/60 mb-6">₹{p.price?.toLocaleString()}</p>

                            {/* MOVE TO BAG BUTTON */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); moveToCart(p); }}
                                className="w-full py-3 bg-white text-black text-[9px] uppercase tracking-[0.3em] font-bold rounded-[10px] hover:bg-[#d4a373] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_#d4a37360]"
                            >
                                Move to Bag
                            </button>
                        </div>
                    </div>

                    {/* Decorative Glow behind card */}
                    <div className="absolute -inset-2 bg-[#d4a373]/20 rounded-[30px] blur-[20px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"></div>

                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default SelectionVault;