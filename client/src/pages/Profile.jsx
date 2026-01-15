import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth"; // Corrected path
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  // Context
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  
  // State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // --- IDENTITY SYNC PROTOCOL ---
  useEffect(() => {
    if (auth?.user) {
      const { email, name, phone, address } = auth.user;
      setName(name || "");
      setEmail(email || "");
      setPhone(phone || "");
      setAddress(address || "");
    }
  }, [auth?.user]);

  // --- UPDATE SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put("https://house-of-rahaa-store.onrender.com/api/v1/auth/profile", {
        name,
        password,
        phone,
        address,
      });

      if (data?.error) {
        toast.error(data.error);
      } else {
        // 🔄 GLOBAL SYNC: Context & LocalStorage update
        setAuth({ ...auth, user: data?.updatedUser });
        let ls = localStorage.getItem("auth");
        ls = JSON.parse(ls);
        ls.user = data.updatedUser;
        localStorage.setItem("auth", JSON.stringify(ls));
        
        toast.success("Identity Secured in Vault 🏛️");
      }
    } catch (error) {
      console.log(error);
      toast.error("Protocol Update Failed: Check Connection");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#d4a373] selection:text-black relative overflow-hidden">
      
      {/* 🌌 AURORA OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#d4a373]/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className="max-w-4xl mx-auto pt-32 pb-20 px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a373]/30 bg-[#d4a373]/5">
              <span className="text-[#d4a373] tracking-[0.4em] text-[9px] uppercase font-black">Identity Protocol</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter">Your Profile</h1>
          <button 
            onClick={() => navigate(-1)} 
            className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
          >
            ← Back to Previous Epoch
          </button>
        </div>

        {/* PROFILE FORM */}
        <div className="bg-white/[0.02] border border-white/10 p-8 md:p-14 rounded-[50px] backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Name input */}
              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 ml-4 font-bold">Public Name</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 p-5 rounded-2xl focus:border-[#d4a373] outline-none transition-all placeholder:text-white/10"
                  placeholder="Inscribe Name..."
                  required
                />
              </div>

              {/* Email - Non Editable */}
              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 ml-4 font-bold">Registry Email</p>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-white/[0.01] border border-white/5 p-5 rounded-2xl text-white/20 cursor-not-allowed font-mono italic"
                />
              </div>

              {/* Phone input */}
              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 ml-4 font-bold">Contact Channel</p>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 p-5 rounded-2xl focus:border-[#d4a373] outline-none transition-all"
                  placeholder="Registry Phone..."
                  required
                />
              </div>

              {/* Password input */}
              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 ml-4 font-bold">New Cipher (Optional)</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 p-5 rounded-2xl focus:border-[#d4a373] outline-none transition-all"
                  placeholder="Update Security Token..."
                />
              </div>
            </div>

            {/* Address input */}
            <div className="space-y-3">
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 ml-4 font-bold">Shipping Residence</p>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="4"
                className="w-full bg-white/[0.02] border border-white/10 p-6 rounded-[30px] focus:border-[#d4a373] outline-none transition-all leading-relaxed"
                placeholder="Enter Detailed delivery coordinates..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-7 bg-white text-black font-black uppercase text-[10px] tracking-[0.7em] rounded-full hover:bg-[#d4a373] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-95"
            >
              Commit Changes
            </button>
          </form>
        </div>
      </div>

      <footer className="py-20 text-center opacity-10">
          <p className="text-[9px] tracking-[2em] uppercase">House of Rahaa Identity Vault</p>
      </footer>
    </div>
  );
};

export default Profile;