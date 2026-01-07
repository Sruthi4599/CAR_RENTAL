import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"; // ✅ NEW

// Initialize Express App
const app = express();

// Connect Database
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => res.send("Server is running"));

// Routes
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter); // ✅ cancel booking works here
app.use("/api/users", userRouter);
app.use("/api/dashboard", dashboardRoutes); // ✅ DASHBOARD ROUTES

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
