import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import { sendOrderEmail } from "../helpers/emailHelper.js"; // 🔥 Email helper import

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

// Phase 1: Create Order
export const checkoutController = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
        return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Convert to Paise
      currency: "INR",
      receipt: `rahaa_rcpt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    
    // Sync logic: Key ID-ah frontend-ku anupuroom to avoid 401 error
    res.status(200).json({ 
      success: true, 
      order, 
      key: process.env.RAZORPAY_API_KEY 
    });
  } catch (error) {
    console.log("❌ Razorpay Order Error:", error);
    res.status(500).send({ success: false, error: error.message });
  }
};

// Phase 2: Verify and Save
export const paymentVerificationController = async (req, res) => {
  try {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        cart, 
        address,
        giftMessage 
    } = req.body;

    // 1. Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 2. Calculation for Email (Total amount in INR)
      const totalAmount = cart.reduce((acc, item) => acc + (item.price || 0), 0);

      // 3. Save Order to Database
      const order = new orderModel({
        products: cart,
        payment: { 
            razorpay_order_id, 
            razorpay_payment_id, 
            success: true,
            amount: totalAmount // Storing in INR for ledger
        },
        buyer: req.user._id,
        shippedTo: address,
        giftMessage: giftMessage || "",
      });
      
      await order.save();

      // 🔥 Phase 3: DISPATCH LUXURY EMAILS
      try {
          // Send to User & Admin via Helper
          await sendOrderEmail(
              req.user.email, 
              order._id.toString(), 
              totalAmount, 
              cart
          );
          console.log("🏛️ Acquisition Emails Dispatched");
      } catch (emailErr) {
          console.log("⚠️ Email Dispatch Failed but Order Saved:", emailErr.message);
      }

      res.status(200).json({ 
        success: true, 
        message: "Acquisition Secured! 🏛️",
        orderId: order._id 
      });

    } else {
      res.status(400).json({ success: false, message: "Security Signature Mismatch" });
    }
  } catch (error) {
    console.log("❌ Verification Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};