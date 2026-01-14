import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSound } from "../../context/sound"; // 🔊 Sound

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState(""); // ✅ Correct
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { playSound } = useSound();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    playSound("click");

    try {
      // ✅ Sending all 6 required fields
      const res = await axios.post("http://localhost:5000/api/v1/auth/register", {
        name,
        email,
        password,
        phone,
        address,
        answer,
      });

      if (res && res.data.success) {
        playSound("success");
        toast.success(res.data.message);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Registration Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#d4a373] flex items-center justify-center relative overflow-hidden py-20">
      
      {/* 🌌 DEEP SPACE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-[#d4a373]/5 rounded-full blur-[200px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 📝 GLASS REGISTRY FORM */}
      <div className="relative z-10 w-full max-w-2xl p-6 animate-in slide-in-from-bottom-10 duration-700">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
          
          <div className="text-center mb-10">
            <h1 className="font-serif italic text-4xl text-white mb-2">New Identity</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">
              Archive Access Protocol
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-xs tracking-widest outline-none focus:border-[#d4a373] text-white placeholder:text-white/20" placeholder="FULL NAME" required onFocus={() => playSound("hover")} />

            {/* Email */}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-xs tracking-widest outline-none focus:border-[#d4a373] text-white placeholder:text-white/20" placeholder="EMAIL ADDRESS" required onFocus={() => playSound("hover")} />

            {/* Password */}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-xs tracking-widest outline-none focus:border-[#d4a373] text-white placeholder:text-white/20" placeholder="SET PASSCODE" required onFocus={() => playSound("hover")} />

            {/* Phone */}
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-xs tracking-widest outline-none focus:border-[#d4a373] text-white placeholder:text-white/20" placeholder="COMM LINK (PHONE)" required onFocus={() => playSound("hover")} />

            {/* Address */}
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-xs tracking-widest outline-none focus:border-[#d4a373] text-white placeholder:text-white/20 md:col-span-2 h-24 resize-none" placeholder="BASE LOCATION (ADDRESS)" required onFocus={() => playSound("hover")}></textarea>

            {/* Secret Answer ✅ (இப்போது இது உள்ளது) */}
            <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-xs tracking-widest outline-none focus:border-[#d4a373] text-white placeholder:text-white/20 md:col-span-2" placeholder="SECURITY KEY (FAV SPORT)" required onFocus={() => playSound("hover")} />

            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                className="w-full bg-[#d4a373] text-black py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all duration-300 shadow-lg active:scale-95"
                disabled={loading}
              >
                {loading ? "Registering..." : "Create Identity"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => navigate("/login")} className="text-[9px] text-white/40 uppercase tracking-widest hover:text-white transition-colors">
              Already have an identity? <span className="text-[#d4a373]">Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;