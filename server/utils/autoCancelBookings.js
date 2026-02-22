import Booking from "../models/Booking.js";

export const autoCancelPendingBookings = async () => {
  try {

    const expiredBookings = await Booking.find({
      status: "pending",
      expiresAt: { $lt: new Date() }
    });

    for (const booking of expiredBookings) {

      booking.status = "cancelled";
      booking.paymentStatus = "refunded";
      booking.refundAmount = booking.price;
      booking.cancelledBy = "SYSTEM";
      booking.cancelledAt = new Date();

      await booking.save();

      console.log(`Auto refunded booking ${booking._id}`);
    }

  } catch (error) {
    console.error("Auto cancel error:", error);
  }
};