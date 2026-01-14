import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  addProductController,
  getProductController,
  deleteProductController,
  getSingleProductController,
  updateProductController,
  relatedProductController,
  createRazorpayOrderController,
  verifyRazorpayPaymentController
} from "../controllers/productController.js";

const router = express.Router();

// CRUD Routes
router.post("/add-product", requireSignIn, isAdmin, addProductController);
router.put("/update-product/:pid", requireSignIn, isAdmin, updateProductController);
router.get("/get-product", getProductController);
router.get("/get-product/:slug", getSingleProductController);
router.delete("/delete-product/:pid", requireSignIn, isAdmin, deleteProductController);
router.get("/related-product/:pid/:cid", relatedProductController);

// 💳 PAYMENT ROUTES (RAZORPAY)
router.post("/razorpay/order", requireSignIn, createRazorpayOrderController);
router.post("/razorpay/verify", requireSignIn, verifyRazorpayPaymentController);

export default router;