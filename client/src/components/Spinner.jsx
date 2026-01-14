import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Spinner = ({ path = "login" }) => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    
    // Count 0 ஆனால் Redirect செய்யவும்
    count === 0 && navigate(`/${path}`, {
        state: location.pathname, // வந்த பாதையை நினைவில் கொள்ள
    });
    
    return () => clearInterval(interval);
  }, [count, navigate, location, path]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#050505] text-[#d4a373]">
      <div className="w-16 h-16 border-4 border-[#d4a373] border-t-transparent rounded-full animate-spin mb-4"></div>
      <h1 className="text-xl font-serif italic tracking-widest">
        Redirecting to Vault Access in {count}...
      </h1>
    </div>
  );
};

export default Spinner;