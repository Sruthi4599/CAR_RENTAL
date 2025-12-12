import express from "express";
import {
  changeBookingStatus,
  checkAvailabilityOfCar,
  createBooking,
  getOwnerBookings,
  getUserBookings,
  generateBookingPDF, // <- required import
} from "../controller/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityOfCar);
bookingRouter.post("/create", protect, createBooking);
bookingRouter.post("/user", protect, getUserBookings);
bookingRouter.post("/owner", protect, getOwnerBookings);
bookingRouter.post("/change-status", protect, changeBookingStatus);

// PDF receipt download (streams application/pdf)
bookingRouter.get("/:id/receipt", protect, generateBookingPDF);

export default bookingRouter;
