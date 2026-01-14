import React, { useState, useEffect } from "react";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const [subTotal, setSubTotal] = useState(0);
  const [gst, setGst] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const navigate = useNavigate();

  // --- IMAGE HELPER ---
  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/400x500?text=Artifact";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_300/");
    }
    return url;
  };

  // --- 🔥 UPDATED CALCULATION LOGIC (Subtotal + GST) ---
  useEffect(() => {
    let totalAmount = 0;
    cart?.forEach((item) => {
      totalAmount += item.price;
    });
    
    const calculatedGst = totalAmount * 0.12; // 12% GST
    setSubTotal(totalAmount);
    setGst(calculatedGst);
    setFinalTotal(totalAmount + calculatedGst);
  }, [cart]);

  // --- REMOVE ITEM ---
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
      toast.success("Artifact removed from bag");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans flex flex-col relative overflow-hidden">
      
      {/* 🌌 DEEP SPACE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-[#d4a373]/5 rounded-full blur-[150px]"></div>
         <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 🛸 NAV (Updated for consistency) */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-6 py-6 flex justify-between items-center">
          <div className="flex flex-col cursor-pointer group" onClick={() => navigate("/")}>
              <h2 className="font-serif italic text-2xl text-white group-hover:text-[#d4a373] transition-colors tracking-tighter">House of Rahaa</h2>
          </div>
          <p className="hidden md:block text-[9px] uppercase tracking-[0.5em] text-white/30">Acquisition Interface v2.0</p>
          <div className="flex gap-8 items-center">
            <button onClick={() => navigate("/vault")} className="text-[10px] uppercase tracking-widest hover:text-[#d4a373] transition-all">Vault</button>
          </div>
      </nav>

      {/* 📦 CONTENT */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-12 relative z-10">
        
        <div className="mb-12 flex items-baseline gap-4">
            <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter">Your Bag</h1>
            <div className="h-[1px] flex-1 bg-white/10 hidden md:block mx-4"></div>
            <p className="text-[#d4a373] text-xs uppercase tracking-[0.4em] font-black">
                {cart?.length || 0} Artifacts
            </p>
        </div>
        
        {cart?.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-20 items-start">
             
             {/* LEFT: ITEMS LIST */}
             <div className="flex-1 w-full space-y-6">
                {cart.map((p, index) => (
                   <div key={index} className="group relative flex items-center gap-8 p-6 bg-white/[0.01] border border-white/5 rounded-[30px] hover:bg-white/[0.03] transition-all duration-700">
                      
                      <div className="w-32 h-44 bg-[#0a0a0a] rounded-[20px] overflow-hidden shrink-0 border border-white/10 relative">
                         <img 
                            src={transformImage(p.image)} 
                            alt={p.name} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                         />
                      </div>

                      <div className="flex-1"> 
                         <p className="text-[#d4a373] text-[9px] uppercase tracking-[0.4em] mb-2 opacity-60">
                            {p.category?.name || "Premium Collection"}
                         </p>
                         <h3 className="font-serif text-3xl text-white italic mb-2">{p.name}</h3>
                         <p className="text-white/40 text-sm font-light leading-relaxed line-clamp-2 max-w-md">
                            {p.description}
                         </p>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch py-2">
                         <p className="font-mono text-2xl text-white tracking-tighter">₹{p.price?.toLocaleString()}</p>
                         <button 
                           onClick={() => removeCartItem(p._id)}
                           className="text-[9px] text-red-500/40 uppercase tracking-[0.3em] hover:text-red-500 transition-all border-b border-transparent hover:border-red-500"
                         >
                           Dispose
                         </button>
                      </div>
                   </div>
                ))}
             </div>

             {/* RIGHT: SUMMARY INTERFACE */}
             <div className="w-full lg:w-[480px] shrink-0 sticky top-32">
                <div className="p-12 bg-[#050505] border border-white/5 rounded-[50px] shadow-2xl relative overflow-hidden">
                   
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a373]/5 rounded-full blur-[80px]"></div>

                   <h3 className="text-xs uppercase tracking-[0.5em] text-[#d4a373] mb-10 font-black">Acquisition Summary</h3>
                   
                   <div className="space-y-6 mb-12">
                      <div className="flex justify-between text-sm text-white/50">
                         <span className="font-light tracking-widest uppercase">Artifact Value</span>
                         <span className="font-mono text-white">₹{subTotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-white/30">
                         <span className="font-light tracking-widest uppercase">Tax (GST 12%)</span>
                         <span className="font-mono">+ ₹{gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between text-sm text-white/50">
                         <span className="font-light tracking-widest uppercase">Logistics</span>
                         <span className="text-[#d4a373] font-black tracking-tighter">Complimentary</span>
                      </div>

                      <div className="h-[1px] w-full bg-white/5 my-8"></div>

                      <div className="flex justify-between items-end">
                         <span className="font-serif italic text-3xl">Net Total</span>
                         <span className="text-4xl font-mono text-[#d4a373] tracking-tighter">₹{Math.round(finalTotal).toLocaleString()}</span>
                      </div>
                   </div>

                   {/* NAVIGATION BUTTON */}
                   <button 
                     onClick={() => navigate("/checkout")} 
                     className="w-full py-7 bg-[#d4a373] text-black text-[11px] uppercase tracking-[0.6em] font-black rounded-full hover:bg-white transition-all duration-700 shadow-[0_20px_50px_rgba(212,163,115,0.15)] hover:scale-[1.02] active:scale-95 mb-6"
                   >
                     Secure Acquisition
                   </button>

                   <p className="text-center text-[8px] uppercase tracking-[0.4em] text-white/20">
                     Official Protocol for House of Rahaa
                   </p>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-10">
             <div className="w-px h-32 bg-gradient-to-b from-transparent via-[#d4a373]/30 to-transparent"></div>
             <p className="font-serif italic text-4xl text-white/20 tracking-tighter">The acquisition bag is empty.</p>
             <button 
                onClick={() => navigate("/")} 
                className="text-[10px] uppercase tracking-[0.8em] text-[#d4a373] hover:text-white transition-all py-4 px-10 border border-[#d4a373]/20 rounded-full hover:border-white"
             >
                Browse Artifacts
             </button>
          </div>
        )}
      </div>

      <footer className="p-12 text-center opacity-10 mt-auto">
          <p className="text-[8px] uppercase tracking-[1em]">End-to-End Secure Acquisition • 2026</p>
      </footer>
    </div>
  );
};

export default CartPage;