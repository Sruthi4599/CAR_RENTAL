import mongoose from "mongoose";
import Booking from "../models/Booking.js";

const checkAvailability = async (
  car,
  pickupDate,
  returnDate,
  excludeBookingId = null
) => {
  const start = new Date(pickupDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(returnDate);
  end.setHours(23, 59, 59, 999);

  const query = {
    car: new mongoose.Types.ObjectId(car),
    status: { $ne: "cancelled" },
    pickupDate: { $lte: end },
    returnDate: { $gte: start },
  };

  if (excludeBookingId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
  }

  const bookings = await Booking.find(query);
  return bookings.length === 0;
};

export default checkAvailability;
