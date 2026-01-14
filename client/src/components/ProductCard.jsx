import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/wishlist";
import { useCart } from "../context/cart";
import { useSound } from "../context/sound"; 
import toast from "react-hot-toast";

const ProductCard = ({ p, openQuickView }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist, toggleWishlist] = useWishlist();
  const [cart, setCart] = useCart();
  const { playSound } = useSound(); 
  
  const isInVault = wishlist?.some((item) => item._id === p._id);
  
  // --- 3D TILT LOGIC ---
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; 
    const y = (e.clientY - top - height / 2) / 25; 
    setRotate({ x: -y, y: x });
    setOpacity(1);
  };

  const handleMouseEnter = () => {
    playSound("hover"); 
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setOpacity(0);
  };

  const transformImage = (url) => {
    if (!url) return "https://via.placeholder.com/400x500?text=No+Visual";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
    }
    return url;
  };

  return (
    <div 
      className="group relative w-full aspect-[3/4] cursor-pointer perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // 🔥 MAIN CLICK: Product Page-ku kootittu pogum
      onClick={() => {
        playSound("click"); 
        navigate(`/product/${p.slug}`);
      }}
    >
      <div 
        ref={cardRef}
        className="w-full h-full relative rounded-[20px] transition-all duration-100 ease-out preserve-3d shadow-2xl overflow-hidden"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* GLOW EFFECT */}
        <div 
            className="absolute inset-0 rounded-[20px] pointer-events-none z-50 transition-opacity duration-500"
            style={{
                background: `radial-gradient(circle at ${50 + rotate.y * 5}% ${50 + rotate.x * 5}%, rgba(255,255,255,0.15), transparent 60%)`,
                opacity: opacity
            }}
        />

        {/* IMAGE LAYER */}
        <div className="absolute inset-0 overflow-hidden rounded-[20px]">
           <img 
             src={transformImage(p.image)} 
             alt={p.name} 
             className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
           
           {/* ADD TO BAG BUTTON (ON IMAGE) */}
           <button 
             onClick={(e) => {
               e.stopPropagation(); // 🔥 Card click logic-ah thadukkum
               playSound("success"); 
               setCart([...cart, p]);
               localStorage.setItem('cart', JSON.stringify([...cart, p]));
               toast.success("Added to Bag");
             }}
             className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#d4a373] hover:scale-110 shadow-lg"
           >
             <span className="text-xl font-bold pb-1">+</span>
           </button>
        </div>

        {/* CONTENT LAYER */}
        <div 
          className="absolute bottom-0 left-0 w-full p-6"
          style={{ transform: "translateZ(30px)" }} 
        >
           <p className="text-[#d4a373] text-[8px] uppercase tracking-[0.4em] mb-2 drop-shadow-lg">{p.category?.name}</p>
           <h3 className="font-serif text-2xl text-white italic mb-2 drop-shadow-md">{p.name}</h3>
           
           <div className="flex justify-between items-center border-t border-white/20 pt-4">
              <span className="font-mono text-lg text-white">₹{p.price?.toLocaleString()}</span>
              
              <div className="flex gap-2 relative z-[70]">
                 {/* 👁 QUICK VIEW BUTTON - FIXED LOGIC */}
                 <button 
                   onClick={(e) => { 
                       e.stopPropagation(); // 🔥 Details page-ku pogaama thadukkum
                       playSound("open"); 
                       openQuickView(p); // Modal-ah open pannum
                   }}
                   className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-[#d4a373] hover:text-black transition-all"
                   title="Quick View"
                 >
                   👁
                 </button>

                 {/* ★ WISHLIST BUTTON */}
                 <button 
                   onClick={(e) => { 
                       e.stopPropagation(); // 🔥 Details page-ku pogaama thadukkum
                       playSound("click"); 
                       toggleWishlist(p); 
                   }}
                   className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${isInVault ? "bg-[#d4a373] text-black border-[#d4a373]" : "bg-black/20 text-white border-white/20 hover:bg-white hover:text-black"}`}
                 >
                   {isInVault ? "★" : "☆"}
                 </button>
              </div>
           </div>
        </div>

        {/* PRISM BORDER EFFECT */}
        <div className="absolute inset-0 rounded-[20px] border border-white/5 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;