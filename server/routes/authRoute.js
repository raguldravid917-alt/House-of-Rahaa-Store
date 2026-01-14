import express from "express";
import {
  registerController,
  loginController,
  testController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  addToVaultController,
  getWishlistController,
  updateProfileController,
  removeFromVaultController
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- 1. PUBLIC ROUTES ---
router.post("/register", registerController);
router.post("/login", loginController);

// --- 2. USER PROTECTED ROUTES (Login Required) ---
// Auth check for Frontend PrivateRoute
router.get("/user-auth", requireSignIn, (req, res) => { 
    res.status(200).send({ ok: true }); 
});

// Profile Management
router.put("/profile", requireSignIn, updateProfileController); 

// Personal Orders Ledger
router.get("/orders", requireSignIn, getOrdersController);

// Vault / Wishlist Protocol
router.post("/add-to-vault", requireSignIn, addToVaultController);
router.get("/get-wishlist", requireSignIn, getWishlistController);
router.delete("/remove-from-vault/:pid", requireSignIn, removeFromVaultController); 

// --- 3. ADMIN PROTECTED ROUTES (Login + Admin Role Required) ---
// Auth check for Frontend AdminRoute
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => { 
    res.status(200).send({ ok: true }); 
});

// Admin Control Over Global Ledger
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);

// Test Route (Ensure this is exported in authController.js)
router.get("/test", requireSignIn, isAdmin, testController);

export default router;