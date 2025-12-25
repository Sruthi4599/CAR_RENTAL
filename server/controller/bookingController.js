import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import { calculateDynamicPrice } from "../utils/pricingEngine.js";
import checkAvailability from "../utils/checkAvailability.js";

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

    const pricing = await calculateDynamicPrice(car, pickupDate, returnDate);

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      pickupDate,
      returnDate,
      price: pricing.totalPrice,
      status: "confirmed",
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
    const bookings = await Booking.find().populate("car user");
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== CANCEL BOOKING ===================== */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== EXTEND BOOKING ===================== */
export const extendBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnDate } = req.body;

    const booking = await Booking.findById(id).populate("car");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be extended",
      });
    }

    const currentReturn = new Date(booking.returnDate);
    const newReturn = new Date(returnDate);

    if (newReturn <= currentReturn) {
      return res.status(400).json({
        success: false,
        message: "New return date must be after current return date",
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
        message: "Car is not available for the selected date",
      });
    }

    const pricing = await calculateDynamicPrice(
      booking.car,
      booking.pickupDate,
      newReturn
    );

    booking.returnDate = newReturn;
    booking.price = pricing.totalPrice;
    await booking.save();

    res.json({
      success: true,
      message: "Booking extended successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== PDF RECEIPT ===================== */
export const generateBookingPDF = async (req, res) => {
  res.status(501).json({ success: false, message: "PDF not implemented" });
};

/* ===================== CHANGE STATUS ===================== */
export const changeBookingStatus = async (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented" });
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
export const getUnavailableDates = async (req, res) => {
  try {
    const { carId } = req.params;

    const bookings = await Booking.find({
      car: carId,
      status: { $ne: "cancelled" }
    });

    let disabledDates = [];

    bookings.forEach((booking) => {
      let current = new Date(booking.pickupDate);
      const end = new Date(booking.returnDate);

      while (current <= end) {
        disabledDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    res.json({
      success: true,
      disabledDates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
