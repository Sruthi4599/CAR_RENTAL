import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";

// Routes
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Initialize Express App
const app = express();

// Connect Database
await connectDB();

// ✅ MIDDLEWARE (ORDER MATTERS)
const allowedOrigins = [
  "https://onlinecarrental.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// 🔥 THIS HANDLES PREFLIGHT AUTOMATICALLY IN EXPRESS 5
app.use(cors(corsOptions));


app.use(express.json());

// Test Route
app.get("/", (req, res) => res.send("Server is running"));

// Routes
app.use("/api/users", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);

// Server
const PORT = process.env.PORT || 3000;// ✅ MATCH FRONTEND
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
