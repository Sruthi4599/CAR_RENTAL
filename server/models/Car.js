import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },

    brand: {
      type: String,
      required: true
    },

    model: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    year: {
      type: Number,
      required: true
    },

    fuel_type: {
      type: String,
      required: true
    },

    transmission: {
      type: String,
      required: true
    },

    seating_capacity: {
      type: Number,
      required: true
    },

    pricePerDay: {
      type: Number,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    image: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    // ✅ IMPORTANT FIX
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);
