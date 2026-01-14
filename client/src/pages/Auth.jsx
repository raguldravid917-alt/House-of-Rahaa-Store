import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from "../context/auth"; 

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState(""); 
    const [address, setAddress] = useState(""); 
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const [auth, setAuth] = useAuth(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(isLogin ? "Verifying Digital DNA..." : "Encrypting Profile...", {
            style: { background: '#0a0a0a', color: '#d4a373', border: '1px solid #d4a37333' }
        });

        try {
            const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register";
            const payload = isLogin 
                ? { email: email.toLowerCase(), password } 
                : { name, email: email.toLowerCase(), password, phone, address };

            const { data } = await axios.post(`http://localhost:5000${endpoint}`, payload);

            if (data?.success) {
                toast.success(data.message, { id: toastId });
                setAuth({ ...auth, user: data.user, token: data.token });
                localStorage.setItem("auth", JSON.stringify(data));
                
                setTimeout(() => {
                    const destination = data?.user?.role === 1 ? "/dashboard/admin" : (location.state || "/");
                    navigate(destination);
                }, 1200);
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Link Interrupted", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#d4a373] selection:text-black">
            
            <div className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] bg-[#1a0104] rounded-full blur-[180px] opacity-30 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#d4a373] rounded-full blur-[250px] opacity-[0.03]"></div>
            
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4a373 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-[520px] w-full bg-white/[0.01] backdrop-blur-3xl border border-white/5 p-12 md:p-20 rounded-[80px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-10 animate-in fade-in zoom-in duration-1000 relative overflow-hidden">
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-[#d4a373]/50 to-transparent"></div>

                <div className="text-center mb-16 space-y-6">
                    <div className="inline-block px-4 py-1 border border-[#d4a373]/20 rounded-full mb-4">
                        <span className="text-[7px] tracking-[0.6em] text-[#d4a373] uppercase font-bold">Identity Verification</span>
                    </div>
                    <h1 className="font-serif text-7xl md:text-8xl text-white italic tracking-tighter drop-shadow-2xl">Rahaa</h1>
                    <p className="text-[9px] text-gray-700 tracking-[0.5em] uppercase font-light">Digital Vault Access • Est 2026</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="group relative">
                                <label className="text-[8px] uppercase tracking-[0.4em] text-gray-600 mb-2 block ml-6">Legal Identity</label>
                                <input 
                                    type="text" placeholder="NAME" value={name} onChange={(e)=>setName(e.target.value)} 
                                    className="w-full bg-white/[0.02] border border-white/5 py-4 px-8 rounded-full outline-none focus:border-[#d4a373]/40 text-white text-[10px] tracking-widest uppercase transition-all placeholder:opacity-20" required 
                                />
                            </div>
                            <div className="group relative">
                                <label className="text-[8px] uppercase tracking-[0.4em] text-gray-600 mb-2 block ml-6">Satellite Coordinates</label>
                                <input 
                                    type="text" placeholder="PHONE" value={phone} onChange={(e)=>setPhone(e.target.value)} 
                                    className="w-full bg-white/[0.02] border border-white/5 py-4 px-8 rounded-full outline-none focus:border-[#d4a373]/40 text-white text-[10px] tracking-widest uppercase transition-all" required 
                                />
                            </div>
                            <div className="group relative">
                                <label className="text-[8px] uppercase tracking-[0.4em] text-gray-600 mb-2 block ml-6">Physical Residence</label>
                                <textarea 
                                    placeholder="ADDRESS" value={address} onChange={(e)=>setAddress(e.target.value)} 
                                    className="w-full bg-white/[0.02] border border-white/5 py-4 px-8 rounded-[30px] outline-none focus:border-[#d4a373]/40 text-white text-[10px] tracking-widest uppercase h-24 resize-none transition-all scrollbar-hide" required 
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="group relative">
                        <label className="text-[8px] uppercase tracking-[0.4em] text-gray-600 mb-2 block ml-6">Digital Correspondence</label>
                        <input 
                            type="email" 
                            placeholder="EMAIL_ADDRESS" 
                            value={email} 
                            onChange={(e)=>setEmail(e.target.value)} 
                            className="w-full bg-white/[0.02] border border-white/5 py-4 px-8 rounded-full outline-none focus:border-[#d4a373]/40 text-white text-[11px] tracking-widest lowercase transition-all placeholder:uppercase placeholder:opacity-20" 
                            required 
                        />
                    </div>

                    <div className="group relative">
                        <label className="text-[8px] uppercase tracking-[0.4em] text-gray-600 mb-2 block ml-6">Vault Access Key</label>
                        <input 
                            type="password" 
                            placeholder="SECURITY_KEY" 
                            value={password} 
                            onChange={(e)=>setPassword(e.target.value)} 
                            className="w-full bg-white/[0.02] border border-white/5 py-4 px-8 rounded-full outline-none focus:border-[#d4a373]/40 text-white text-[11px] tracking-widest transition-all placeholder:uppercase placeholder:opacity-20" 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#d4a373] text-black py-6 rounded-full text-[11px] font-black tracking-[0.6em] uppercase mt-10 hover:bg-white hover:scale-[1.02] transition-all duration-700 shadow-[0_20px_50px_rgba(212,163,115,0.2)] disabled:opacity-30 relative group overflow-hidden"
                    >
                        <span className="relative z-10">{loading ? "Synchronizing..." : isLogin ? "Request Access" : "Create Profile"}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </form>

                <div className="mt-16 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-gray-600 text-[8px] tracking-[0.4em] uppercase hover:text-[#d4a373] transition-all duration-500 relative py-2"
                    >
                        {isLogin ? "New Connoisseur? Initiate Membership" : "Existing Member? Authentication Protocol"}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#d4a373]/30 transition-all"></div>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-10 flex flex-col items-center gap-4 opacity-30">
                <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#d4a373]"></div>
                <p className="text-[8px] text-gray-500 tracking-[1.2em] uppercase ml-[1.2em]">End-to-End Encryption • Rahaa 2026</p>
            </div>
        </div>
    );
};

export default Auth;