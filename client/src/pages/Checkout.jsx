import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Checkout = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/100?text=Artifact";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_200/");
    }
    return url;
  };

  // 🔥 CALCULATION PROTOCOL
  const { subTotal, gst, finalTotal } = useMemo(() => {
    const amount = cart?.reduce((acc, item) => acc + (item.price || 0), 0) || 0;
    const priceAfterDiscount = amount - discount;
    const calculatedGst = priceAfterDiscount * 0.12; 
    return {
      subTotal: amount,
      gst: calculatedGst,
      finalTotal: Math.round(priceAfterDiscount + calculatedGst)
    };
  }, [cart, discount]);

  useEffect(() => {
    if (!cart?.length) {
        const timeout = setTimeout(() => navigate("/"), 2500);
        return () => clearTimeout(timeout);
    }
    if (auth?.user?.address && !address) {
        setAddress(auth.user.address);
    }
  }, [cart, auth, navigate, address]);

  const handleApplyCoupon = () => {
    if (!coupon) return toast.error("Enter code to unlock privilege");
    if (coupon.toUpperCase() === "RAHAA10") {
        const disc = subTotal * 0.10; 
        setDiscount(disc);
        toast.success(`Privilege Unlocked! Saved ₹${disc.toLocaleString()}`);
    } else {
        setDiscount(0);
        toast.error("Invalid Privilege Code");
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCoupon("");
    toast.error("Privilege Revoked");
  };

  // --- 💳 PAYMENT PROTOCOL ---
  const handlePayment = async () => {
    if (!address || address.length < 10) {
        return toast.error("Provide a detailed delivery residence (min 10 chars)");
    }
    
    if (!window.Razorpay) {
        return toast.error("Razorpay SDK not found. Please refresh the page.");
    }

    setLoading(true);

    try {
        console.log("🛠️ Establishing Secure Vault Link...");
        
        // 1. Backend-la Order ID create panroom
        const { data } = await axios.post("http://localhost:5000/api/v1/payment/checkout", {
            amount: finalTotal 
        }, { headers: { Authorization: auth?.token } });

        // Logic check: Backend-la irundhu Key-ah fetch panna best, illana Dashboard key match aaganum
        if (!data?.success) {
            setLoading(false);
            return toast.error("Vault Connection Failed");
        }

        console.log("✅ Order Secured. Opening Gateway...");

        // 2. Razorpay Configuration
        const options = {
            // MUKKIYAM: Backend-la irundhu vara Key-ah use pannuvom (Sync aagum)
            key: data.key || "rzp_test_S24W5Sa2MzKpUi", 
            amount: data.order.amount, 
            currency: "INR",
            name: "HOUSE OF RAHAA",
            description: "Premium Artifact Acquisition",
            image: "https://cdn-icons-png.flaticon.com/512/4440/4440494.png",
            order_id: data.order.id, 
            handler: async function (response) {
                console.log("🔐 Payment Captured. Verifying Signature...");
                try {
                    setLoading(true);
                    toast.loading("Verifying Protocol...", { id: "verify" });
                    
                    // 3. Signature Verification request to server
                    // Backend-la razorpay_signature verify aaga intha key names romba mukkiyam
                    const verifyRes = await axios.post("http://localhost:5000/api/v1/payment/paymentverification", {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        cart,
                        address, // Pass address for order storage
                        giftMessage: isGift ? giftMessage : "" 
                    }, { headers: { Authorization: auth?.token } });

                    if (verifyRes.data.success) {
                        toast.dismiss("verify");
                        toast.success("Acquisition Secured! 🏛️");
                        localStorage.removeItem("cart"); 
                        setCart([]); 
                        navigate("/dashboard/user/orders"); 
                    }
                } catch (err) {
                    toast.dismiss("verify");
                    toast.error("Protocol Verification Failed");
                    console.error("Verification Error:", err);
                } finally {
                    setLoading(false);
                }
            },
            modal: { 
                ondismiss: () => {
                    console.log("⚠️ Transaction Cancelled");
                    setLoading(false);
                }
            },
            prefill: {
                name: auth?.user?.name || "",
                email: auth?.user?.email || "",
                contact: auth?.user?.phone || ""
            },
            theme: { color: "#d4a373" } 
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        
    } catch (error) {
        console.error("❌ Gateway Initiation Error:", error);
        toast.error("Gateway Inaccessible. Check Console.");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-32 px-6 lg:px-20 pb-20 relative selection:bg-[#d4a373] selection:text-black">
      
      {/* ⚠️ FULL SCREEN LOADER */}
      {loading && (
          <div className="fixed inset-0 bg-[#050505]/95 z-[9999] flex flex-col items-center justify-center text-center backdrop-blur-xl">
              <div className="w-16 h-16 border-t-2 border-[#d4a373] border-solid rounded-full animate-spin mb-8"></div>
              <h2 className="text-[#d4a373] font-serif italic text-2xl tracking-[0.2em] animate-pulse uppercase">Establishing Vault Link</h2>
              <p className="text-white/30 text-[9px] mt-4 uppercase tracking-[0.4em]">Transaction in Progress</p>
          </div>
      )}

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#1a0104] rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto mb-20 flex flex-col items-center">
          <span className="text-[#d4a373] text-[10px] uppercase tracking-[0.8em] font-black mb-4 opacity-70">Final Protocol</span>
          <h1 className="text-5xl md:text-8xl font-serif italic text-white text-center tracking-tighter leading-none">Secure Acquisition</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-20 max-w-[1500px] mx-auto items-start relative z-10">
        
        {/* LEFT SECTION */}
        <div className="lg:w-[60%] w-full space-y-12">
           <section className="bg-white/[0.02] border border-white/5 p-12 rounded-[60px] backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-8 mb-12">
                  <div className="w-12 h-12 border border-[#d4a373]/30 rounded-full flex items-center justify-center text-[#d4a373] font-serif italic text-xl">1</div>
                  <h3 className="text-3xl font-serif italic tracking-tight">Shipping Protocol</h3>
              </div>
              <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 ml-4">Delivery Residence</label>
                  <textarea 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter precise coordinates for delivery..."
                    className="w-full bg-white/[0.01] border border-white/10 p-8 rounded-[40px] h-48 focus:border-[#d4a373] outline-none transition-all text-sm leading-loose tracking-wide placeholder:text-white/10" 
                  />
              </div>
           </section>

           <section className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] backdrop-blur-3xl">
              <div className="flex justify-between items-center mb-6 px-4">
                <label className="text-[9px] uppercase tracking-[0.4em] text-white/40">Privilege Code</label>
                {discount > 0 && <button onClick={removeCoupon} className="text-[8px] text-red-500 uppercase tracking-widest hover:underline">Revoke</button>}
              </div>
              <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={coupon} 
                    disabled={discount > 0}
                    onChange={(e) => setCoupon(e.target.value)} 
                    placeholder={discount > 0 ? "RAHAA10 ACTIVE" : "Enter Code"} 
                    className="flex-1 bg-white/[0.02] border border-white/10 p-5 rounded-full outline-none text-[#d4a373] text-center tracking-widest disabled:opacity-40"
                  />
                  <button 
                    onClick={handleApplyCoupon} 
                    disabled={discount > 0}
                    className="px-12 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#d4a373] transition-all disabled:bg-white/5"
                  >
                    Apply
                  </button>
              </div>
           </section>
           
           <section 
             className={`p-12 rounded-[60px] border transition-all duration-700 cursor-pointer ${isGift ? 'bg-[#1a0104]/40 border-[#d4a373]/40' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}
             onClick={() => setIsGift(!isGift)}
           >
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                      <span className="text-4xl filter grayscale brightness-150">{isGift ? '✨' : '🎁'}</span>
                      <div>
                          <h3 className="text-lg font-black uppercase tracking-[0.3em] text-[#d4a373]">Bespoke Gifting</h3>
                          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-2 italic font-light">Complimentary personalized manuscript</p>
                      </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full border border-[#d4a373]/30 flex items-center justify-center transition-all ${isGift ? 'bg-[#d4a373] text-black' : 'opacity-20'}`}>
                      {isGift && <span className="text-xs font-black">✓</span>}
                  </div>
              </div>
              {isGift && (
                  <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-700">
                      <textarea 
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Inscribe your personal manuscript..."
                        className="w-full bg-black/40 border border-[#d4a373]/20 p-8 rounded-[30px] h-40 outline-none text-md font-serif italic text-[#d4a373]/70 focus:border-[#d4a373]"
                      />
                  </div>
              )}
           </section>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:w-[40%] w-full sticky top-32">
           <div className="bg-[#0a0a0a] p-12 rounded-[70px] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4a373]/5 blur-[60px] rounded-full group-hover:bg-[#d4a373]/10 transition-all duration-1000"></div>
              
              <h3 className="text-[10px] uppercase tracking-[0.6em] text-center text-[#d4a373] mb-12 font-black opacity-60">Acquisition Ledger</h3>
              
              <div className="space-y-8 mb-14 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                  {cart?.map((p, i) => (
                    <div key={i} className="flex justify-between items-center group/item">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-20 rounded-[15px] bg-black border border-white/5 overflow-hidden shadow-xl">
                                <img src={transformImage(p.image)} alt={p.name} className="w-full h-full object-cover opacity-50 grayscale group-hover/item:opacity-100 group-hover/item:grayscale-0 transition-all duration-700"/>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-white font-serif italic tracking-wide">{p.name}</span>
                                <span className="text-[7px] uppercase tracking-[0.3em] text-white/20 mt-1">{p.category?.name || "Masterpiece"}</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#d4a373]/60">₹{p.price.toLocaleString()}</span>
                    </div>
                  ))}
              </div>

              <div className="space-y-6 mb-14 text-[9px] uppercase tracking-[0.3em] font-bold text-white/30">
                  <div className="flex justify-between px-2">
                      <span>Value</span>
                      <span className="text-white font-mono">₹{subTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                      <div className="flex justify-between px-2 text-[#d4a373]">
                          <span>Privilege</span>
                          <span className="font-mono">- ₹{discount.toLocaleString()}</span>
                      </div>
                  )}
                  <div className="flex justify-between px-2">
                      <span>GST (12%)</span>
                      <span className="font-mono">+ ₹{gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-[1px] bg-white/5 my-8"></div>
                  <div className="flex justify-between text-white text-4xl pt-2 px-2 items-end">
                      <span className="font-serif italic">Net Total</span>
                      <span className="text-[#d4a373] font-mono tracking-tighter">₹{finalTotal.toLocaleString()}</span>
                  </div>
              </div>

              <button 
                  onClick={handlePayment} 
                  disabled={loading || !address}
                  className={`w-full py-8 rounded-full font-black uppercase text-[11px] tracking-[0.6em] transition-all duration-700 shadow-2xl 
                  ${loading 
                    ? 'bg-white/5 text-white/20 cursor-wait' 
                    : 'bg-[#d4a373] text-black hover:bg-white hover:scale-[1.01] active:scale-95 shadow-[#d4a373]/20'
                  }`}
              >
                  {loading ? "Processing..." : "Secure Acquisition"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;