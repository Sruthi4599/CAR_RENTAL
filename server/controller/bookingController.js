import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import { calculateDynamicPrice } from "../utils/pricingEngine.js";
import checkAvailability from "../utils/checkAvailability.js";
import PDFDocument from "pdfkit";
import { getRefundPercentage } from "../utils/refundCalculator.js";

/* ===================== HELPER: MINIMUM 1 DAY ===================== */
const ensureMinimumOneDay = (pickupDate, returnDate) => {
  let days =
    (new Date(returnDate) - new Date(pickupDate)) /
    (1000 * 60 * 60 * 24);

  days = Math.ceil(days);
  if (days < 1) days = 1;

  return days;
};

/* ===================== CREATE BOOKING ===================== */
export const createBooking = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const available = await checkAvailability(carId, pickupDate, returnDate);
    if (!available) {
      return res.status(400).json({ success: false, message: "Car not available" });
    }

    // ✅ enforce minimum 1 day
    const days = ensureMinimumOneDay(pickupDate, returnDate);

    const pricing = await calculateDynamicPrice(
      car,
      pickupDate,
      new Date(
        new Date(pickupDate).getTime() + days * 24 * 60 * 60 * 1000
      )
    );

    const booking = await Booking.create({
      user: req.user._id,
      owner: car.owner,
      car: carId,
      pickupDate,
      returnDate,
      price: pricing.totalPrice,
      status: "confirmed",
      paymentStatus: "PAID"
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== GET USER BOOKINGS ===================== */
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== GET OWNER BOOKINGS ===================== */
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user");

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== CANCEL BOOKING (FAKE REFUND) ===================== */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled"
      });
    }

    const now = new Date();
    const pickupTime = new Date(booking.pickupDate);

    const diffMs = pickupTime - now;
    const hoursBeforePickup = diffMs / (1000 * 60 * 60);

    if (hoursBeforePickup <= 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel after pickup time"
      });
    }

    // 💰 Fake refund logic
    const refundPercent = getRefundPercentage(hoursBeforePickup);
    const refundAmount = booking.price * refundPercent;

    booking.status = "cancelled";
    booking.refundAmount = refundAmount;
    booking.paymentStatus = refundAmount > 0 ? "REFUNDED" : "PAID";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      refundPercentage: refundPercent * 100,
      refundAmount
    });

  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== EXTEND BOOKING ===================== */
export const extendBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnDate, payment } = req.body;

    const booking = await Booking.findById(id).populate("car");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be extended"
      });
    }

    const newReturn = new Date(returnDate);
    if (newReturn <= booking.returnDate) {
      return res.status(400).json({
        success: false,
        message: "New return date must be after current return date"
      });
    }

    const available = await checkAvailability(
      booking.car._id,
      booking.pickupDate,
      newReturn,
      booking._id
    );

    if (!available) {
      return res.status(400).json({
        success: false,
        message: "Car not available for extension"
      });
    }

    // 🔥 Calculate new price
    const pricing = await calculateDynamicPrice(
      booking.car,
      booking.pickupDate,
      newReturn
    );

    const newTotal = pricing.totalPrice;
    const extraAmount = newTotal - booking.price;

    // 🔴 FIRST CALL → ask for payment
    if (extraAmount > 0 && !payment) {
      return res.status(400).json({
        success: false,
        message: "Additional payment required",
        extraAmount
      });
    }

    

    // ✅ UPDATE BOOKING ONCE
    booking.returnDate = newReturn;
    booking.price = newTotal;

    await booking.save();

    res.json({
      success: true,
      message: "Booking extended successfully",
      extraAmount
    });

  } catch (error) {
    console.error("Extend booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ===================== PDF RECEIPT ===================== */
export const generateBookingPDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("car")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking_${booking._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(22).text("Car Rental Receipt", { align: "center" });
    doc.moveDown();

    doc.text(`Booking ID: ${booking._id}`);
    doc.text(`Customer: ${booking.user.name}`);
    doc.text(`Car: ${booking.car.brand} ${booking.car.model}`);
    doc.text(`Pickup: ${booking.pickupDate.toDateString()}`);
    doc.text(`Return: ${booking.returnDate.toDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text(`Total Price: ₹${booking.price}`);
    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== CHANGE STATUS ===================== */
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== CHECK AVAILABILITY ===================== */
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;
    const available = await checkAvailability(carId, pickupDate, returnDate);
    res.json({ success: true, available });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== UNAVAILABLE DATES ===================== */
export const getUnavailableDates = async (req, res) => {
  try {
    const { carId } = req.params;
    const { bookingId } = req.query; // 👈 NEW

    const query = {
      car: carId,
      status: { $ne: "cancelled" }
    };

    // ✅ EXCLUDE CURRENT BOOKING WHEN EXTENDING
    if (bookingId) {
      query._id = { $ne: bookingId };
    }

    const bookings = await Booking.find(query);

    let disabledDates = [];

    bookings.forEach((booking) => {
      let current = new Date(booking.pickupDate);
      const end = new Date(booking.returnDate);

      while (current <= end) {
        disabledDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    res.json({ success: true, disabledDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
