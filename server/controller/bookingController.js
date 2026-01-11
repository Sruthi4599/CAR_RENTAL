import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import { calculateDynamicPrice } from "../utils/pricingEngine.js";
import checkAvailability from "../utils/checkAvailability.js";
import PDFDocument from "pdfkit";
import { getRefundPercentage } from "../utils/refundCalculator.js";

/* ===================== HELPER ===================== */
const ensureMinimumOneDay = (pickupDate, returnDate) => {
  let days =
    (returnDate - pickupDate) / (1000 * 60 * 60 * 24);

  days = Math.ceil(days);
  if (days < 1) days = 1;
  return days;
};

/* ===================== CREATE BOOKING (FIXED) ===================== */
export const createBooking = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;

    if (!carId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const pickup = new Date(pickupDate);
    const ret = new Date(returnDate);

    if (isNaN(pickup) || isNaN(ret) || ret < pickup) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup or return date"
      });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    /* 🔐 HARD BLOCK: DATE OVERLAP CHECK */
    const conflict = await Booking.findOne({
    car: carId,
    status: { $ne: "cancelled" },
    pickupDate: { $lte: ret },
    returnDate: { $gte: pickup }
  });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Car is not available for selected dates"
      });
    }

    const days = ensureMinimumOneDay(pickup, ret);

    const pricing = await calculateDynamicPrice(
      car,
      pickup,
      new Date(pickup.getTime() + days * 24 * 60 * 60 * 1000)
    );

    const booking = await Booking.create({
      user: req.user._id,
      owner: car.owner,
      car: carId,
      pickupDate: pickup,
      returnDate: ret,
      price: pricing.totalPrice,
      status: "pending",        // 🔴 FIXED
      paymentStatus: "PAID"
    });

    res.json({ success: true, booking });

  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== PREVIEW PRICE ===================== */
export const previewBookingPrice = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;

    const pickup = new Date(pickupDate);
    const ret = new Date(returnDate);

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const days = ensureMinimumOneDay(pickup, ret);

    const pricing = await calculateDynamicPrice(
      car,
      pickup,
      new Date(pickup.getTime() + days * 24 * 60 * 60 * 1000)
    );

    res.json({ success: true, pricing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== USER BOOKINGS ===================== */
export const getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("car")
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
};

/* ===================== OWNER BOOKINGS ===================== */
export const getOwnerBookings = async (req, res) => {
  const bookings = await Booking.find({ owner: req.user._id })
    .populate("car user");

  res.json({ success: true, bookings });
};

/* ===================== CANCEL BOOKING ===================== */
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  if (booking.status === "cancelled") {
    return res.status(400).json({ success: false, message: "Already cancelled" });
  }

  const isOwner = booking.owner.toString() === req.user._id.toString();
  const isUser = booking.user.toString() === req.user._id.toString();

  if (!isOwner && !isUser) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const refundPercent = isOwner
    ? 1
    : getRefundPercentage(
        (new Date(booking.pickupDate) - new Date()) /
          (1000 * 60 * 60)
      );

  booking.status = "cancelled";
  booking.refundAmount = booking.price * refundPercent;
  booking.paymentStatus = refundPercent > 0 ? "REFUNDED" : "PAID";
  booking.cancelledBy = isOwner ? "OWNER" : "USER";
  booking.cancelledAt = new Date();

  await booking.save();
  res.json({ success: true, booking });
};

/* ===================== EXTEND BOOKING ===================== */
export const extendBooking = async (req, res) => {
  const { id } = req.params;
  const { returnDate, payment } = req.body;

  const booking = await Booking.findById(id).populate("car");
  if (!booking) {
    return res.status(404).json({ success: false });
  }

  const available = await checkAvailability(
    booking.car._id,
    booking.pickupDate,
    returnDate,
    booking._id
  );

  if (!available) {
    return res.status(400).json({ success: false, message: "Car not available" });
  }

  const pricing = await calculateDynamicPrice(
    booking.car,
    booking.pickupDate,
    new Date(returnDate)
  );

  const extraAmount = pricing.totalPrice - booking.price;

  if (extraAmount > 0 && !payment) {
    return res.status(400).json({
      success: false,
      message: "Additional payment required",
      extraAmount
    });
  }

  booking.returnDate = new Date(returnDate);
  booking.price = pricing.totalPrice;
  await booking.save();

  res.json({ success: true, extraAmount });
};

/* ===================== PDF ===================== */
export const generateBookingPDF = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("car")
    .populate("user");

  if (!booking) return res.status(404).json({ success: false });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);
  doc.text(`Booking ID: ${booking._id}`);
  doc.text(`Car: ${booking.car.brand}`);
  doc.text(`Price: ₹${booking.price}`);
  doc.end();
};

/* ===================== STATUS ===================== */
export const changeBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  const booking = await Booking.findById(bookingId);
  booking.status = status;
  await booking.save();
  res.json({ success: true });
};

/* ===================== AVAILABILITY ===================== */
export const checkAvailabilityOfCar = async (req, res) => {
  const { carId, pickupDate, returnDate } = req.body;
  const available = await checkAvailability(carId, pickupDate, returnDate);
  res.json({ success: true, available });
};

/* ===================== UNAVAILABLE DATES ===================== */
export const getUnavailableDates = async (req, res) => {
  const bookings = await Booking.find({
    car: req.params.carId,
    status: { $ne: "cancelled" }
  });

  let disabledDates = [];
  bookings.forEach((b) => {
    let d = new Date(b.pickupDate);
    while (d <= b.returnDate) {
      disabledDates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  });

  res.json({ success: true, disabledDates });
};
