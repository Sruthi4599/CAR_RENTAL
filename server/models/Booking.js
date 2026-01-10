import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true
    },

    pickupDate: {          // ✅ NOT pickupTime
      type: Date,
      required: true
    },

    returnDate: {
      type: Date,
      required: true
    },

    price: {               // ✅ NOT amount
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed"
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "REFUNDED"],
      default: "PAID"
    },

    refundAmount: {
      type: Number,
      default: 0
    },
    extensionPayment: {
  type: Number,
  default: 0
},

    cancelledAt: Date
  },
  { timestamps: true }
  
);

export default mongoose.model("Booking", bookingSchema);
