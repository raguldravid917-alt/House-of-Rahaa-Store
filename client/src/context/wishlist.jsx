import React, { useState, useEffect, useContext, createContext } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "./auth"; 

const WishlistContext = createContext();

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [auth] = useAuth();
  const API_URL = "https://house-of-rahaa-store.onrender.com"; 

  // 1. 🔄 LOAD WISHLIST (Initial Load or Login)
  useEffect(() => {
    const fetchVault = async () => {
      try {
        let token = auth?.token;
        if (!token) {
          const localAuth = localStorage.getItem("auth");
          if (localAuth) token = JSON.parse(localAuth).token;
        }

        if (token) {
          const { data } = await axios.get(`${API_URL}/api/v1/auth/get-wishlist`, {
            headers: { Authorization: token }
          });
          if (data?.success) {
            setWishlist(data.wishlist);
            localStorage.setItem("rahaa_wishlist", JSON.stringify(data.wishlist));
          }
        }
      } catch (error) {
        console.log("Vault Fetch Error:", error);
      }
    };

    if (auth?.token) {
        fetchVault();
    } else {
        // Guest mode-la irundha local storage-la irundhu edukkum
        const localWish = localStorage.getItem("rahaa_wishlist");
        if (localWish) setWishlist(JSON.parse(localWish));
    }
  }, [auth?.token]); 

  // 2. ⚡ TOGGLE LOGIC (Add if not exists, Remove if exists)
  const toggleWishlist = async (product) => {
    console.log("🖱️ Vault Action for:", product.name);

    try {
      let token = auth?.token;
      if (!token) {
        const localAuth = localStorage.getItem("auth");
        if (localAuth) token = JSON.parse(localAuth).token;
      }

      // 🔍 Check if product is already in the wishlist state
      const isExisting = wishlist.find((item) => item._id === product._id);

      if (token) {
        if (isExisting) {
          // 🔥 REMOVE PROTOCOL
          console.log("🗑️ Removing from Backend...");
          const { data } = await axios.delete(
            `${API_URL}/api/v1/auth/remove-from-vault/${product._id}`, 
            { headers: { Authorization: token } }
          );

          if (data?.success) {
            const updated = wishlist.filter((item) => item._id !== product._id);
            setWishlist(updated);
            localStorage.setItem("rahaa_wishlist", JSON.stringify(updated));
            toast.error("Removed from Vault");
          }
        } else {
          // ✨ ADD PROTOCOL
          console.log("🏛️ Adding to Backend...");
          const { data } = await axios.post(
            `${API_URL}/api/v1/auth/add-to-vault`,
            { pid: product._id },
            { headers: { Authorization: token } }
          );

          if (data?.success) {
            const updated = [...wishlist, product];
            setWishlist(updated);
            localStorage.setItem("rahaa_wishlist", JSON.stringify(updated));
            toast.success("Artifact Secured in Vault 🏛️");
          }
        }
      } else {
        // 🛡️ GUEST MODE LOGIC
        const exists = wishlist.find((item) => item._id === product._id);
        let updatedList;
        
        if (exists) {
            updatedList = wishlist.filter((item) => item._id !== product._id);
            toast.error("Removed from Selection");
        } else {
            updatedList = [...wishlist, product];
            toast.success("Saved to Selection Vault 💎");
        }
          
        setWishlist(updatedList);
        localStorage.setItem("rahaa_wishlist", JSON.stringify(updatedList));
      }
    } catch (error) {
      console.error("❌ Vault Update Error:", error);
      toast.error("Vault update failed!");
    }
  };

  return (
    <WishlistContext.Provider value={[wishlist, setWishlist, toggleWishlist]}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom Hook
const useWishlist = () => useContext(WishlistContext);

export { useWishlist, WishlistProvider };