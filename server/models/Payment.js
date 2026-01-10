import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: String,
  carId: String,
  amount: Number,
  transactionId: String,
  status: String,
  method: {
    type: String,
    default: "FAKE_GATEWAY",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);
