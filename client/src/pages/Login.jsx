import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import { useSound } from "../../context/sound"; // 🔊 Sound

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useAuth();
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { playSound } = useSound(); // 🔊 சத்தம் கொடுக்கும் Hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    playSound("click"); // கிளிக் சத்தம்
    
    try {
      const res = await axios.post("http://localhost:5000/api/v1/auth/login", {
        email,
        password,
      });
      
      if (res && res.data.success) {
        playSound("success"); // வெற்றி சத்தம்
        toast.success(res.data && res.data.message);
        setAuth({
          ...auth,
          user: res.data.user,
          token: res.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(res.data));
        
        // அனிமேஷனுக்காக 1 நொடி தாமதம்
        setTimeout(() => {
            navigate(location.state || "/");
        }, 1000);
      } else {
        toast.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Access Denied");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#d4a373] flex items-center justify-center relative overflow-hidden">
      
      {/* 🌌 DEEP SPACE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-[#d4a373]/5 rounded-full blur-[200px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[200px] animate-pulse"></div>
          <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 🔐 GLASS PORTAL FORM */}
      <div className="relative z-10 w-full max-w-md p-8 animate-in zoom-in duration-700">
          
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
              
              {/* Top Shimmer Effect */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

              <div className="text-center mb-10">
                  <h1 className="font-serif italic text-4xl text-white mb-2">Welcome Back</h1>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">Authenticate Identity</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Email Input */}
                  <div className="group">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-sm text-center tracking-widest outline-none focus:border-[#d4a373] focus:bg-white/[0.02] transition-all text-white placeholder:text-white/20"
                        placeholder="IDENTITY (EMAIL)"
                        required
                        onFocus={() => playSound("hover")}
                      />
                  </div>

                  {/* Password Input */}
                  <div className="group">
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-sm text-center tracking-widest outline-none focus:border-[#d4a373] focus:bg-white/[0.02] transition-all text-white placeholder:text-white/20"
                        placeholder="PASSCODE"
                        required
                        onFocus={() => playSound("hover")}
                      />
                  </div>

                  {/* Action Button */}
                  <button 
                    type="submit"
                    className="w-full bg-white text-black py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-[#d4a373] transition-all duration-300 shadow-lg active:scale-95 relative overflow-hidden"
                    disabled={loading}
                  >
                    {loading ? (
                        <span className="animate-pulse">Scanning...</span>
                    ) : (
                        "Grant Access"
                    )}
                    {/* Button Glow Animation */}
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>

              </form>

              <div className="mt-8 text-center space-y-4">
                  <button onClick={() => navigate("/forgot-password")} className="text-[9px] text-white/30 uppercase tracking-widest hover:text-white transition-colors">Lost Passcode?</button>
                  <div className="h-[1px] w-1/2 mx-auto bg-white/5"></div>
                  <button onClick={() => navigate("/register")} className="text-[9px] text-[#d4a373] uppercase tracking-widest hover:text-white transition-colors border border-[#d4a373]/20 px-6 py-2 rounded-full hover:bg-[#d4a373]/10">
                      Initiate New Identity
                  </button>
              </div>

          </div>
      </div>

    </div>
  );
};

export default Login;