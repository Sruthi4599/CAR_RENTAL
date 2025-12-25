import express from "express";
import {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  cancelBooking,
  extendBooking,
  generateBookingPDF,
  changeBookingStatus,
  checkAvailabilityOfCar,
   getUnavailableDates ,
} from "../controller/bookingController.js";

import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityOfCar);
bookingRouter.post("/create", protect, createBooking);
bookingRouter.post("/user", protect, getUserBookings);
bookingRouter.post("/owner", protect, getOwnerBookings);
bookingRouter.post("/change-status", protect, changeBookingStatus);
bookingRouter.post("/cancel/:bookingId", protect, cancelBooking);
bookingRouter.put("/extend/:id", protect, extendBooking);
bookingRouter.get("/:id/receipt", protect, generateBookingPDF);
bookingRouter.get(
  "/unavailable-dates/:carId",
  getUnavailableDates
);
export default bookingRouter;
