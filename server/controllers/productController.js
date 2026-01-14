import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import slugify from "slugify";
import Razorpay from "razorpay"; 
import crypto from "crypto";

// --- 1. ADD PRODUCT ---
export const addProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;
    switch (true) {
      case !name: return res.status(400).send({ message: "Name is Required" });
      case !description: return res.status(400).send({ message: "Description is Required" });
      case !price: return res.status(400).send({ message: "Price is Required" });
      case !category: return res.status(400).send({ message: "Category is Required" });
      case !image: return res.status(400).send({ message: "Image URL is Required" });
    }
    const product = new productModel({ name, slug: slugify(name), description, price: Number(price), category, quantity: Number(stock) || 0, image });
    await product.save();
    res.status(201).send({ success: true, message: "Asset Archived 🏛️", product });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Database Error", error: error.message });
  }
};

// --- 2. GET ALL PRODUCTS ---
export const getProductController = async (req, res) => {
  try {
    const products = await productModel.find({}).populate("category").select("-photo").limit(12).sort({ createdAt: -1 });
    res.status(200).send({ success: true, countTotal: products.length, message: "All Products Fetched", products });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error Fetching Products", error: error.message });
  }
};

// --- 3. GET SINGLE PRODUCT ---
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel.findOne({ slug: req.params.slug }).populate("category");
    res.status(200).send({ success: true, message: "Single Product Fetched", product });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error Getting Product", error: error.message });
  }
};

// --- 4. UPDATE PRODUCT ---
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;
    const { pid } = req.params;
    const product = await productModel.findByIdAndUpdate(pid, { ...req.body, slug: name ? slugify(name) : undefined, quantity: stock ? Number(stock) : undefined }, { new: true });
    res.status(200).send({ success: true, message: "Product Updated", product });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error Updating Product", error: error.message });
  }
};

// --- 5. DELETE PRODUCT ---
export const deleteProductController = async (req, res) => {
  try {
    const { pid } = req.params;
    await productModel.findByIdAndDelete(pid);
    res.status(200).send({ success: true, message: "Product Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error Deleting Product", error: error.message });
  }
};

// --- 6. RELATED PRODUCTS ---
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel.find({ category: cid, _id: { $ne: pid } }).select("-photo").limit(4).populate("category");
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, message: "Error Getting Related Products", error });
  }
};

// ==========================================
//          PAYMENT CONTROLLERS 💳
// ==========================================

// 👇👇👇 உண்மையான KEYS (நீ கொடுத்தது) 👇👇👇
const RAZORPAY_ID = "rzp_test_S3ERP8Ss1gv2Wf";  
const RAZORPAY_SECRET = "mxsjojcCbL3w6Ymge50wzZ9X"; 

// --- 7. RAZORPAY ORDER ---
export const createRazorpayOrderController = async (req, res) => {
  try {
    const { cart } = req.body;
    let total = 0;
    cart.map((i) => { total += i.price; });

    console.log("--------------------------------");
    console.log("DEBUG: Using Hardcoded Keys");
    console.log("Total Amount:", total);

    if (total <= 0) return res.status(400).json({ success: false, message: "Cart amount is 0" });

    const instance = new Razorpay({
      key_id: RAZORPAY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const options = {
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    res.json({ success: true, order });

  } catch (error) {
    console.log("❌ RAZORPAY CREATE ERROR:", error);
    res.status(500).send({ success: false, message: "Payment Creation Failed", error: error.message });
  }
};

// --- 8. RAZORPAY VERIFY ---
export const verifyRazorpayPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = new orderModel({
        products: cart,
        payment: { id: razorpay_payment_id, status: "Success", method: "Razorpay" },
        buyer: req.user._id,
      });
      await order.save();
      res.json({ success: true, message: "Payment Verified & Order Saved" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.log("❌ RAZORPAY VERIFY ERROR:", error);
    res.status(500).send({ success: false, message: "Verification Failed", error: error.message });
  }
};