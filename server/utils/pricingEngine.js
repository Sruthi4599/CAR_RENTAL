import Booking from "../models/Booking.js";

/**
 * Calculate dynamic price for a car booking
 * Same-day pickup & return = 1 day rental
 */
export const calculateDynamicPrice = async (
  car,
  pickupDate,
  returnDate
) => {
  const basePrice = car.pricePerDay;

  const start = new Date(pickupDate);
  const end = new Date(returnDate);

  let noOfDays = Math.ceil(
    (end - start) / (1000 * 60 * 60 * 24)
  );

  // ✅ FIX: same-day booking = 1 day
  if (noOfDays < 1) noOfDays = 1;

  let finalPricePerDay = basePrice;

  // 1️⃣ Weekend surge
  const day = start.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) {
    finalPricePerDay *= 1.2;
  }

  // 2️⃣ High demand surge
  const activeBookings = await Booking.countDocuments({
    car: car._id,
    status: { $ne: "cancelled" }
  });

  if (activeBookings >= 3) {
    finalPricePerDay *= 1.3;
  }

  // 3️⃣ Long duration discount
  if (noOfDays >= 7) {
    finalPricePerDay *= 0.9;
  }

  const totalPrice = Math.round(finalPricePerDay * noOfDays);

  return {
    pricePerDay: Math.round(finalPricePerDay),
    totalPrice,
    noOfDays
  };
};
