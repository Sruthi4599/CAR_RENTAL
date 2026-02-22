import express from "express";
import {
  createBooking,
  previewBookingPrice,
  getUserBookings,
  getOwnerBookings,
  cancelBooking,
  extendBooking,
  generateBookingPDF,
  changeBookingStatus,
  checkAvailabilityOfCar,
  getUnavailableDates
} from "../controller/bookingController.js";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

/* ===================== AVAILABILITY & PRICING ===================== */
bookingRouter.post("/preview-price", protect, previewBookingPrice);
bookingRouter.post("/check-availability", checkAvailabilityOfCar);
bookingRouter.get("/unavailable-dates/:carId", getUnavailableDates);

/* ===================== CREATE BOOKING ===================== */
bookingRouter.post(
  "/create",
  protect,
  upload.single("license"),
  createBooking
);

/* ===================== LIST BOOKINGS ===================== */
bookingRouter.post("/user", protect, getUserBookings);
bookingRouter.post("/owner", protect, getOwnerBookings);

/* ===================== BOOKING ACTIONS ===================== */
bookingRouter.post("/change-status", protect, changeBookingStatus);
bookingRouter.post("/cancel/:bookingId", protect, cancelBooking);
bookingRouter.put("/extend/:id", protect, extendBooking);

/* ===================== RECEIPT (KEEP LAST) ===================== */
bookingRouter.get("/:id/receipt", protect, generateBookingPDF);

export default bookingRouter;
