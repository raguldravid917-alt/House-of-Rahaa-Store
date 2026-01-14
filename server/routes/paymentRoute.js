import express from "express";
import { checkoutController, paymentVerificationController } from "../controllers/paymentController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Order Route
router.post("/checkout", requireSignIn, checkoutController);

// Verify & Save Route
router.post("/paymentverification", requireSignIn, paymentVerificationController);

export default router;