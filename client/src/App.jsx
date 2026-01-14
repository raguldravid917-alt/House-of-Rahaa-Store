import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WishlistProvider } from "./context/wishlist"; 
import { useAuth } from "./context/auth"; 

// PAGES
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import CartPage from "./pages/CartPage";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile"; // ✅ Profile page import
import AdminDashboard from "./pages/AdminDashboard";
import SelectionVault from "./pages/SelectionVault"; 
import ProductDetails from "./pages/ProductDetails"; 
import Checkout from "./pages/Checkout"; 
import AdminOrders from "./pages/AdminOrders";
import CreateCategory from "./pages/CreateCategory";

// ROUTES
import PrivateRoute from "./components/Routes/Private";
import AdminRoute from "./components/Routes/AdminRoute";

function App() {
  const [auth] = useAuth();

  // 👑 Entry Point Logic
  const getEntryPoint = () => {
    if (auth?.token && auth?.user?.role === 1) {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Home />;
  };

  return (
    <WishlistProvider> 
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { 
            background: '#0a0a0a', 
            color: '#d4a373', 
            border: '1px solid rgba(212, 163, 115, 0.1)', 
            borderRadius: '100px',
            fontSize: '12px',
            letterSpacing: '0.1em'
          },
        }} 
      />

      <Routes>
        {/* --- 1. PUBLIC ROUTES --- */}
        <Route path="/" element={getEntryPoint()} />
        <Route path="/login" element={auth?.token ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        
        {/* --- 2. PROTECTED USER ROUTES 🛡️ --- */}
        <Route path="/dashboard" element={<PrivateRoute />}>
            <Route path="user/orders" element={<Orders />} />
            <Route path="user/profile" element={<Profile />} /> {/* ✅ Profile Route Added */}
        </Route>

        {/* --- 3. PRIVATE ACCESS ROUTES --- */}
        <Route path="/checkout" element={auth?.token ? <Checkout /> : <Navigate to="/login" />} />
        <Route path="/vault" element={auth?.token ? <SelectionVault /> : <Navigate to="/login" />} />

        {/* --- 4. ADMIN DASHBOARD 👑 --- */}
        <Route path="/dashboard/admin" element={<AdminRoute />}>
            <Route path="" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="create-category" element={<CreateCategory />} />
        </Route>

        {/* 5. 404 REDIRECT */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WishlistProvider>
  );
}

export default App;