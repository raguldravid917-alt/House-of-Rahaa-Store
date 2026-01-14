import { useState, useContext, createContext, useEffect } from "react";
import { useAuth } from "./auth";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [auth] = useAuth();

  useEffect(() => {
    // யூசர் லாகின் செய்திருந்தால் அவருக்குரிய கார்டை மட்டும் எடுக்கும்
    const storageKey = auth?.user?._id ? `cart_${auth.user._id}` : "guest_cart";
    let existingCartItem = localStorage.getItem(storageKey);
    if (existingCartItem) setCart(JSON.parse(existingCartItem));
    else setCart([]);
  }, [auth?.user?._id]); // யூசர் மாறினால் கார்ட் மாறும்

  // கார்ட் அப்டேட் ஆகும்போதெல்லாம் அந்த யூசரின் ஐடியில் சேமிக்கும்
  useEffect(() => {
    if (auth?.user?._id) {
      localStorage.setItem(`cart_${auth.user._id}`, JSON.stringify(cart));
    } else if (!auth?.user) {
      localStorage.setItem("guest_cart", JSON.stringify(cart));
    }
  }, [cart, auth?.user?._id]);

  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);
export { useCart, CartProvider };