import dotenv from "dotenv"; 
// ⚠️ MUKKIYAM: Dotenv.config eppovum top-la irukanum
dotenv.config(); 

import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/db.js"; // Path + .js Extension

// Route Imports
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";

// Database Connection
connectDB();

const app = express();

// --- 🛠️ MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // Frontend data-ah read panna idhu mukkiyam
app.use(morgan("dev"));

// --- 🛣️ API ROUTES ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Base API
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to House of Rahaa API 🏛️",
    status: "Active"
  });
});

// --- 🚀 SERVER START ---
const PORT = process.env.PORT || 5000;
const MODE = process.env.DEV_MODE || "development";

app.listen(PORT, () => {
  console.log(
    `Server Running on ${MODE} mode on port ${PORT}`.bgCyan.white
  );
  console.log(`Vault Status: Online 🏛️`.bgGreen.white);
});