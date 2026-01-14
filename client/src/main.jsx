import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { SearchProvider } from "./context/search";
import { CartProvider } from "./context/cart";
import { WishlistProvider } from "./context/wishlist";

// ✅ 1. இந்த வரியை சேர் (Import Sound)
import { SoundProvider } from "./context/sound.jsx"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <SearchProvider>
      <CartProvider>
        <WishlistProvider>
          
          {/* ✅ 2. மொத்த ஆப்பையும் இதற்குள் போடு */}
          <SoundProvider> 
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SoundProvider>

        </WishlistProvider>
      </CartProvider>
    </SearchProvider>
  </AuthProvider>
);