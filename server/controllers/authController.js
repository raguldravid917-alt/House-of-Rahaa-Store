import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import { sendStatusEmail } from "../helpers/emailHelper.js"; 
import JWT from "jsonwebtoken";

// 1. REGISTER CONTROLLER
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // "Answer" illama validation
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).send({ success: false, message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({ success: false, message: "Already Registered, please login" });
    }

    const hashedPassword = await hashPassword(password);
    // User-ah save pannum podhu 'answer' thookkiyaachu
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error: error.message,
    });
  }
};
// 2. LOGIN CONTROLLER
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ success: false, message: "Invalid email or password" });
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).send({ success: false, message: "Email is not registered" });
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(200).send({ success: false, message: "Invalid Password" });
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error in login", error: error.message });
  }
};

// 3. UPDATE PROFILE
export const updateProfileController = async (req, res) => {
  try {
    const { name, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    if (password && password.length < 6) return res.json({ error: "Password must be at least 6 characters long" });
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { name: name || user.name, password: hashedPassword || user.password, phone: phone || user.phone, address: address || user.address },
      { new: true }
    ).select("-password");
    res.status(200).send({ success: true, message: "Profile Updated Successfully", updatedUser });
  } catch (error) {
    res.status(400).send({ success: false, message: "Error while updating profile", error: error.message });
  }
};

// 4. VAULT (WISHLIST) CONTROLLERS
export const addToVaultController = async (req, res) => {
  try {
    const { pid } = req.body;
    const user = await userModel.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: pid } }, { new: true });
    res.status(200).send({ success: true, message: "Added to Vault 🏛️", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error adding to vault", error });
  }
};

export const removeFromVaultController = async (req, res) => {
  try {
    const { pid } = req.params;
    const user = await userModel.findByIdAndUpdate(req.user._id, { $pull: { wishlist: pid } }, { new: true });
    res.status(200).send({ success: true, message: "Removed from Vault 🗑️", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error removing from vault", error });
  }
};

export const getWishlistController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate("wishlist");
    const validWishlist = user.wishlist ? user.wishlist.filter((item) => item !== null) : [];
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.status(200).send({ success: true, wishlist: validWishlist });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error getting vault items", error });
  }
};

// 5. ORDERS CONTROLLERS
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({ buyer: req.user._id }).populate("products", "-photo").populate("buyer", "name").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).send({ success: false, message: "Error while getting orders", error });
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({}).populate("products", "-photo").populate("buyer", "name").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).send({ success: false, message: "Error while getting all orders", error });
  }
};

// 🚚 OPTIMIZED ORDER STATUS CONTROLLER
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .populate("buyer", "email name");

    if (!order) return res.status(404).send({ success: false, message: "Order not found" });

    // 🚀 BACKGROUND EMAIL PROTOCOL
    // Inga 'await' use panna koodathu, appo dhaan API fast-ah irukum
    if (order.buyer && order.buyer.email) {
      // User-ku email
      sendStatusEmail(order.buyer.email, status, order._id.toString())
        .then(() => console.log(`✅ Status email dispatched to ${order.buyer.email}`))
        .catch(err => console.log("⚠️ User Email Failed:", err.message));

      // Admin-ku copy
      if (process.env.ADMIN_EMAIL) {
        sendStatusEmail(process.env.ADMIN_EMAIL, `ADMIN LOG: Order is now ${status}`, order._id.toString())
          .then(() => console.log("✅ Admin Log dispatched"))
          .catch(err => console.log("⚠️ Admin Email Failed:", err.message));
      }
    }

    res.json(order);
  } catch (error) {
    console.log("❌ Status Update Error:", error);
    res.status(500).send({ success: false, message: "Status Index Failure", error });
  }
};

// 6. TEST CONTROLLER
export const testController = (req, res) => {
  res.status(200).send({ success: true, message: "Vault Protocol: Secure Access Granted ✅" });
};