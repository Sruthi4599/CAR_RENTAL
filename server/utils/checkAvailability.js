import Booking from "../models/Booking.js";

const checkAvailability = async (
  carId,
  pickupDate,
  returnDate,
  excludeBookingId = null
) => {
  const query = {
    car: carId,
    status: { $ne: "cancelled" }
  };

  // ✅ EXCLUDE CURRENT BOOKING (VERY IMPORTANT)
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const bookings = await Booking.find(query);

  for (let booking of bookings) {
    const existingStart = new Date(booking.pickupDate);
    const existingEnd = new Date(booking.returnDate);
    const requestedStart = new Date(pickupDate);
    const requestedEnd = new Date(returnDate);

    if (
      requestedStart <= existingEnd &&
      requestedEnd >= existingStart
    ) {
      return false;
    }
  }

  return true;
};

export default checkAvailability;
