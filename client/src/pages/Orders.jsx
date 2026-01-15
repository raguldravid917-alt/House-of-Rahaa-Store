import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/auth"; 
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Orders = () => {
  const [auth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [expandedOrderId, setExpandedOrderId] = useState(null); 
  const navigate = useNavigate();
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/400x500?text=Artifact";
    if (typeof url === 'string' && url.includes("cloudinary.com")) {
       return url.replace("/upload/", "/upload/f_auto,q_auto,w_300/");
    }
    return url;
  };

  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("https://house-of-rahaa-store.onrender.com/api/v1/auth/orders", {
        headers: { Authorization: auth?.token }
      });
      setOrders(data);
    } catch (error) {
      console.error("Ledger Error:", error);
      toast.error("Ledger Sync Failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
    else {
      const timer = setTimeout(() => { if(!auth?.token) navigate("/login"); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [auth?.token]);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > 50) {
        if (window.scrollY > lastScrollY.current) setShowNav(false);
        else setShowNav(true);
      } else { setShowNav(true); }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', controlNavbar, { passive: true });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  const getStatusStep = (status) => {
    switch(status) {
        case "Not Process": return 1;
        case "Processing": return 2;
        case "Shipped": return 3;
        case "Delivered": return 4;
        default: return 1;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-t border-[#d4a373] rounded-full animate-spin mb-4"></div>
        <p className="text-[#d4a373] text-[10px] tracking-[0.5em] uppercase">Syncing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#d4a373] selection:text-black relative overflow-hidden">
      
      {/* 🌌 BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#d4a373]/5 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      {/* 🛸 RESPONSIVE FLOATING NAVBAR */}
      <nav className={`fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[1000px] transition-all duration-500 ${showNav ? "translate-y-0 opacity-100" : "-translate-y-40 opacity-0"}`}>
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full px-5 md:px-8 py-3 md:py-5 flex justify-between items-center shadow-2xl">
            <h2 className="font-serif italic text-xl md:text-2xl text-white cursor-pointer" onClick={() => navigate("/")}>Rahaa</h2>
            <div className="flex items-center gap-3 md:gap-6">
                <span className="hidden sm:block text-[10px] text-[#d4a373] font-bold uppercase tracking-widest border-r border-white/10 pr-4 md:pr-6">{auth?.user?.name}</span>
                <button onClick={() => navigate("/")} className="text-[9px] uppercase tracking-widest text-white/60 hover:text-white">Archive</button>
            </div>
        </div>
      </nav>

      {/* 🎬 HEADER - Fixed pt-32 for Mobile overlap */}
      <header className="relative pt-32 md:pt-48 pb-10 md:pb-20 px-6 text-center z-10">
          {/* HISTORY Text - Only on Desktop */}
          <h1 className="hidden md:block text-[12vw] font-serif italic text-white/5 leading-[0.8] select-none pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap blur-[1px]">HISTORY</h1>
          <div className="relative z-10 space-y-2 md:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d4a373]/30 bg-[#d4a373]/5 backdrop-blur-md">
                  <span className="text-[#d4a373] tracking-[0.3em] text-[8px] md:text-[9px] uppercase font-bold">Private Records</span>
              </div>
              <h2 className="text-3xl md:text-6xl font-light text-white tracking-wide">Acquisitions</h2>
          </div>
      </header>

      {/* 📦 ORDERS LIST */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10 pb-40">
        {orders.length === 0 ? (
            <div className="py-20 text-center border border-white/5 rounded-[40px] bg-white/[0.01]">
                <h2 className="text-xl font-serif italic text-white/40 mb-6">Registry Empty</h2>
                <button onClick={() => navigate("/")} className="border border-[#d4a373] text-[#d4a373] px-8 py-3 rounded-full text-[9px] uppercase tracking-widest hover:bg-[#d4a373] hover:text-black transition-all">Explore Collection</button>
            </div>
        ) : (
            <div className="space-y-6 md:space-y-12">
                {orders.map((o) => {
                    const step = getStatusStep(o.status);
                    const isExpanded = expandedOrderId === o._id;
                    const totalValue = o.products?.reduce((acc, p) => acc + (p.price || 0), 0);

                    return (
                        <div key={o._id} className={`bg-white/[0.02] border transition-all duration-700 rounded-[30px] md:rounded-[40px] overflow-hidden backdrop-blur-md ${isExpanded ? 'border-[#d4a373]/40' : 'border-white/10'}`}>
                            
                            {/* Summary Bar */}
                            <div onClick={() => setExpandedOrderId(isExpanded ? null : o._id)} className="p-6 md:p-10 cursor-pointer flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4 md:gap-8 w-full">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg ${o.status === 'Delivered' ? 'bg-green-500/20 text-green-500' : 'bg-[#d4a373]/20 text-[#d4a373]'}`}>
                                        {o.status === 'Delivered' ? '✓' : '❖'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[8px] md:text-[9px] text-white/40 uppercase tracking-widest mb-1 font-mono">ID: {o._id.slice(-8).toUpperCase()}</p>
                                        <p className="text-white font-bold text-[10px] md:text-sm uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="md:hidden text-right">
                                        <p className="text-sm font-serif italic text-[#d4a373]">₹{totalValue?.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="hidden md:flex items-center gap-12 w-auto justify-end">
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase tracking-widest text-white/30">Value</p>
                                        <p className="text-xl font-serif italic text-[#d4a373]">₹{totalValue?.toLocaleString()}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-[#d4a373] text-black' : ''}`}>↓</div>
                                </div>
                            </div>

                            {/* Detailed Inventory */}
                            <div className={`transition-all duration-700 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                <div className="p-6 md:p-10 pt-0 space-y-6 md:space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        {o.products?.map((p, idx) => (
                                            <div key={idx} className="flex gap-4 md:gap-6 items-center bg-white/[0.02] p-3 md:p-4 rounded-[20px] md:rounded-[30px] border border-white/5">
                                                <div className="w-16 h-20 md:w-20 md:h-28 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-black">
                                                    <img 
                                                       src={p.image ? transformImage(p.image) : `https://house-of-rahaa-store.onrender.com/api/v1/product/product-photo/${p._id}`} 
                                                       className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={p.name} 
                                                    />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-serif italic text-sm md:text-lg text-white/90 truncate">{p.name}</h4>
                                                    <p className="text-[#d4a373] font-mono text-[10px] md:text-xs">₹{p.price?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 md:pt-8 border-t border-white/5">
                                        <div className="text-center md:text-left">
                                            <p className="text-[7px] text-white/40 uppercase tracking-[0.3em] mb-2">Acquisition Status</p>
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-[#d4a373]/10 text-[#d4a373]'}`}>{o.status}</span>
                                        </div>
                                        <button onClick={() => setSelectedOrder(o)} className="w-full md:w-auto bg-white text-black px-10 py-3 rounded-full font-bold text-[9px] uppercase tracking-widest hover:bg-[#d4a373] transition-all">Trace Live</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* 🔮 LIVE TRACKING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedOrder(null)}></div>
            <div className="bg-[#050505] border border-[#d4a373]/30 w-full max-w-xl rounded-[30px] md:rounded-[50px] p-8 md:p-12 relative z-10 shadow-2xl">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-white/30 text-xl hover:text-white">×</button>
                <div className="text-center mb-10">
                    <h3 className="text-xl md:text-2xl font-serif italic text-white mb-2">Logistics Protocol</h3>
                    <p className="text-white/40 text-[8px] uppercase tracking-[0.4em] truncate px-4">Artifact: {selectedOrder._id}</p>
                </div>
                <div className="relative space-y-10 ml-4 border-l border-white/10">
                    {[{ label: "Indexed", step: 1 }, { label: "Vault Release", step: 2 }, { label: "In Transit", step: 3 }, { label: "Delivered", step: 4 }].map((item, idx) => {
                        const isDone = getStatusStep(selectedOrder.status) >= item.step;
                        return (
                            <div key={idx} className={`relative pl-8 md:pl-12 ${isDone ? 'opacity-100' : 'opacity-20'}`}>
                                <div className={`absolute left-[-6px] top-1 w-[11px] h-[11px] rounded-full ${isDone ? 'bg-[#d4a373] shadow-[0_0_15px_#d4a373]' : 'bg-white/20'}`}></div>
                                <h4 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-white">{item.label}</h4>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Orders;