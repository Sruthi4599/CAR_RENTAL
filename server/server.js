import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import cron from "node-cron";
import { autoCancelPendingBookings } from "./utils/autoCancelBookings.js";
// Routes
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// Connect Database
await connectDB();

// ✅ SIMPLE CORS (TEMPORARY, SAFE FOR DEBUGGING)
app.use(cors({
  origin: ["https://onlinecarrental.vercel.app","http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ JSON parser
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);
cron.schedule("*/5 * * * *", async () => {
  console.log("Checking expired bookings...");
  await autoCancelPendingBookings();
});
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});