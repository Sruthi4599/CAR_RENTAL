import express from "express";
import {
  changeBookingStatus,
  checkAvailabilityOfCar,
  createBooking,
  getOwnerBookings,
  getUserBookings,
  generateBookingPDF,
  cancelBooking, // ✅ NEW IMPORT
} from "../controller/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

// Check car availability
bookingRouter.post("/check-availability", checkAvailabilityOfCar);

// Create booking
bookingRouter.post("/create", protect, createBooking);

// Get user bookings
bookingRouter.post("/user", protect, getUserBookings);

// Get owner bookings
bookingRouter.post("/owner", protect, getOwnerBookings);

// Change booking status (owner/admin)
bookingRouter.post("/change-status", protect, changeBookingStatus);

// ✅ Cancel booking (user)
bookingRouter.post("/cancel/:bookingId", protect, cancelBooking);

// Download booking receipt (PDF)
bookingRouter.get("/:id/receipt", protect, generateBookingPDF);

export default bookingRouter;
