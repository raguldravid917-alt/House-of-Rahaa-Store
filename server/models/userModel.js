import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    answer: { type: String }, // Optional
    role: { type: Number, default: 0 },
    
    // 👇 INDHA LINE ROMBA MUKKIYAM! (Idhu iruka nu paarunga)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products", // "Products" nu irukanum (Unga ProductModel export name)
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("users", userSchema);