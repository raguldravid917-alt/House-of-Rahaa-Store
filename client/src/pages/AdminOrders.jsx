import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const [statusOptions] = useState(["Not Process", "Processing", "Shipped", "Delivered", "Cancel"]);
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const navigate = useNavigate();

  // --- 🖼️ IMAGE OPTIMIZER ---
  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/100?text=No+Image";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_200/");
    }
    return url;
  };

  // --- GET ALL ORDERS ---
  const getOrders = async () => {
    try {
      const { data } = await axios.get("https://house-of-rahaa-store.onrender.com/api/v1/auth/all-orders", {
        headers: { Authorization: auth?.token }
      });
      setOrders(data);
    } catch (error) {
      console.log(error);
      toast.error("Registry Access Denied: Sync Failed");
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  // --- UPDATE STATUS PROTOCOL ---
  const handleChange = async (orderId, value) => {
    try {
      toast.loading("Updating Protocol...", { id: "status" });
      await axios.put(
        `https://house-of-rahaa-store.onrender.com/api/v1/auth/order-status/${orderId}`,
        { status: value },
        { headers: { Authorization: auth?.token } }
      );
      getOrders();
      toast.success("Protocol Updated", { id: "status" });
    } catch (error) {
      toast.error("Override Failed", { id: "status" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#d4a373] pt-32 px-6 lg:px-16 pb-20 relative overflow-hidden">
      
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#1a0104]/50 to-transparent pointer-events-none"></div>

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-10 relative z-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div>
          <span className="text-[#d4a373] text-[9px] uppercase tracking-[0.8em] font-black opacity-60">System Registry</span>
          <h1 className="text-5xl lg:text-7xl font-serif italic text-white mt-4 tracking-tighter">Master Order Control</h1>
          <p className="text-gray-600 text-[10px] tracking-[0.5em] uppercase mt-4">Overseeing Global Acquisitions</p>
        </div>
        <button 
          onClick={() => navigate("/dashboard/admin")} 
          className="group text-[9px] uppercase tracking-[0.4em] text-gray-500 hover:text-[#d4a373] transition-all flex items-center gap-3"
        >
          <span className="transition-transform group-hover:-translate-x-2">←</span> Terminal Dashboard
        </button>
      </div>

      {/* --- ORDERS GRID --- */}
      <div className="max-w-6xl mx-auto space-y-12 pb-20 relative z-10">
        {orders?.length === 0 ? (
          <div className="py-40 text-center opacity-20 text-[10px] tracking-[1em] uppercase">No active acquisitions recorded</div>
        ) : (
          orders.map((o, i) => (
            <div key={i} className="group bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden transition-all duration-700 hover:border-[#d4a373]/30 backdrop-blur-3xl shadow-2xl">
              
              {/* TOP STRIP: Order Metadata */}
              <div className="bg-white/[0.03] p-8 lg:p-10 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5">
                  <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-bold">Transaction Token</span>
                      <p className="font-mono text-xs text-[#d4a373] tracking-tighter">#{o._id.toUpperCase()}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-bold">Collector Identity</span>
                      <p className="text-sm font-serif italic text-white/90">{o?.buyer?.name || "Guest Connoisseur"}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-bold">Epoch Date</span>
                      <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  
                  {/* STATUS SELECTOR */}
                  <div className="flex flex-col gap-3 items-end">
                      <span className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-bold mr-4">Override Protocol</span>
                      <select 
                          onChange={(e) => handleChange(o._id, e.target.value)} 
                          defaultValue={o?.status}
                          className="bg-black border border-white/10 text-white text-[9px] uppercase tracking-[0.2em] font-black py-3 px-6 rounded-full outline-none cursor-pointer hover:border-[#d4a373] transition-all appearance-none text-center min-w-[160px] shadow-xl"
                      >
                          {statusOptions.map((s, i) => (
                              <option key={i} value={s}>{s}</option>
                          ))}
                      </select>
                  </div>
              </div>

              {/* MIDDLE SECTION: Artifacts List */}
              <div className="p-8 lg:p-12 space-y-8">
                  {o?.products?.map((p, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-center gap-8 group/item">
                          <div className="w-20 h-20 rounded-[25px] overflow-hidden border border-white/5 bg-black shadow-2xl transition-transform duration-700 group-hover/item:scale-105">
                              <img src={transformImage(p.image)} alt={p.name} className="w-full h-full object-cover grayscale opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-700"/>
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                              <h4 className="font-serif italic text-lg text-white mb-1 tracking-wide">{p.name}</h4>
                              <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] font-light">Heritage Artifact • Limited Archive</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs font-mono text-[#d4a373] bg-[#d4a373]/5 px-4 py-2 rounded-full border border-[#d4a373]/10">₹{p.price?.toLocaleString()}</p>
                          </div>
                      </div>
                  ))}
              </div>
              
              {/* FOOTER STRIP: Final Logistics */}
              <div className="px-10 py-6 bg-white/[0.01] flex justify-between items-center border-t border-white/5">
                   <div className="flex items-center gap-4">
                       <span className={`w-2 h-2 rounded-full ${o.payment.success ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
                       <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-gray-500">
                          Secure Link: {o.payment.success ? "Authenticated & Verified" : "Pending Verification"}
                       </span>
                   </div>
                   <div className="text-right">
                       <span className="text-[8px] uppercase tracking-[0.4em] text-gray-700 mr-4">Total Asset Value</span>
                       <span className="text-xl font-serif italic text-white">₹{o.products?.reduce((acc, p) => acc + (p.price || 0), 0).toLocaleString()}</span>
                   </div>
              </div>

            </div>
          ))
        )}
      </div>

      <footer className="mt-20 text-center opacity-20 py-10 border-t border-white/5">
          <p className="text-[8px] uppercase tracking-[1em] text-gray-600">House of Rahaa • Administrator Privilege • 2026</p>
      </footer>
    </div>
  );
};

export default AdminOrders;