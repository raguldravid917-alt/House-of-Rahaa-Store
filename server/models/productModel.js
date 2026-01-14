import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number }, // Original Price
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: { type: Number, required: true },
    image: { type: String }, // Main Image
    images: [{ public_id: String, url: String }], // Gallery
    colors: [{ type: String }],
    sizes: [{ type: String }],
    shipping: { type: Boolean },
    sold: { type: Number, default: 0 },
    ratings: [
      {
        star: Number,
        comment: String,
        postedBy: { type: mongoose.ObjectId, ref: "users" },
      },
    ],
    totalRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ மிக முக்கியம்: "Products" (Plural)
export default mongoose.model("Products", productSchema);