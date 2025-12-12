import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";

/**
 * Returns true if no bookings overlap the given pickup/return dates for the car.
 */
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });
  return bookings.length === 0;
};

// API TO CHECK AVAILABILITY OF CARS FOR THE GIVEN DATE AND LOCATION
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    // fetch all cars at location that are marked available in DB
    const cars = await Car.find({ location, isAvaliable: true });

    // check each car for overlapping bookings
    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvailable === true);

    res.json({ success: true, availableCars });
  } catch (error) {
    console.error("checkAvailabilityOfCar error:", error?.message || error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// API TO CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: "Car is not available" });
    }

    const carData = await Car.findById(car);
    if (!carData) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    // calculate price based on days
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = (carData.pricePerDay || 0) * Math.max(1, noOfDays);

    const booking = await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
    });

    res.json({ success: true, message: "Booking created", booking });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// API to List User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getUserBookings error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// API to get Owner Bookings
export const getOwnerBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const ownerId = req.user._id;
    const bookings = await Booking.find({ owner: ownerId })
      .populate("car")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings: Array.isArray(bookings) ? bookings : [] });
  } catch (error) {
    console.error("getOwnerBookings error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// API TO CHANGE BOOKING STATUS
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({ success: false, message: "Booking ID and status are required." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    console.error("changeBookingStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Generate booking PDF (invoice/receipt) and stream as response
export const generateBookingPDF = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Find booking & populate car + user
    const booking = await Booking.findById(bookingId).populate("car").populate("user");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Create PDF doc
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=booking_${bookingId}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text("Car Rental Invoice", { align: "center" });
    doc.moveDown();

    // Customer
    doc.fontSize(14).text("Customer Details");
    if (booking.user) {
      doc.fontSize(12).text(`Name: ${booking.user.name || "N/A"}`);
      doc.text(`Email: ${booking.user.email || "N/A"}`);
    } else {
      doc.fontSize(12).text("Customer data not available");
    }
    doc.moveDown();

    // Car details
    doc.fontSize(14).text("Car Details");
    doc.fontSize(12).text(`Car: ${booking.car?.brand || ""} ${booking.car?.model || ""}`);
    doc.text(`Year: ${booking.car?.year || ""}`);
    doc.text(`Location: ${booking.car?.location || ""}`);
    doc.moveDown();

    // Booking details
    doc.fontSize(14).text("Booking Details");
    doc.fontSize(12).text(
      `Rental Period: ${booking.pickupDate ? new Date(booking.pickupDate).toISOString().split("T")[0] : ""} → ${booking.returnDate ? new Date(booking.returnDate).toISOString().split("T")[0] : ""}`
    );
    doc.text(`Status: ${booking.status || ""}`);
    doc.text(`Booked On: ${booking.createdAt ? new Date(booking.createdAt).toISOString().split("T")[0] : ""}`);
    doc.moveDown();

    // Payment
    doc.fontSize(14).text("Payment");
    const priceText = booking.price != null ? `Total Price: $${booking.price}` : "Total Price: N/A";
    doc.fontSize(12).text(priceText);
    doc.moveDown(2);

    doc.text("Thank you for choosing CarRental!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("generateBookingPDF error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "PDF generation failed" });
    } else {
      try { res.end(); } catch { /* ignore */ }
    }
  }
};
