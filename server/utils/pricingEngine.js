import Booking from "../models/Booking.js";

/**
 * Calculate dynamic price for a car booking
 */
export const calculateDynamicPrice = async (
  car,
  pickupDate,
  returnDate
) => {
  const basePrice = car.pricePerDay;

  const start = new Date(pickupDate);
  const end = new Date(returnDate);

  const noOfDays = Math.ceil(
    (end - start) / (1000 * 60 * 60 * 24)
  );

  let finalPricePerDay = basePrice;

  // 1️⃣ Weekend surge (Saturday / Sunday)
  const day = start.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) {
    finalPricePerDay *= 1.2; // +20%
  }

  // 2️⃣ High demand surge (more bookings for same car)
  const activeBookings = await Booking.countDocuments({
    car: car._id,
    status: { $ne: "cancelled" }
  });

  if (activeBookings >= 3) {
    finalPricePerDay *= 1.3; // +30%
  }

  // 3️⃣ Long duration discount
  if (noOfDays >= 7) {
    finalPricePerDay *= 0.9; // -10%
  }

  const totalPrice = Math.round(
    finalPricePerDay * noOfDays
  );

  return {
    pricePerDay: Math.round(finalPricePerDay),
    totalPrice
  };
};
