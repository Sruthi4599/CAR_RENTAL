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
    status: { $ne: "cancelled" }, // ✅ ignore cancelled bookings
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });
  return bookings.length === 0;
};

// ======================= CHECK AVAILABILITY =======================
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    const cars = await Car.find({ location, isAvailable: true });

    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvailable === true);

    res.json({ success: true, availableCars });
  } catch (error) {
    console.error("checkAvailabilityOfCar error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= CREATE BOOKING =======================
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
      status: "confirmed",
    });

    // mark car unavailable
    await Car.findByIdAndUpdate(car, { isAvailable: false });

    res.json({ success: true, message: "Booking created", booking });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= USER BOOKINGS =======================
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;

    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getUserBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= OWNER BOOKINGS =======================
export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const bookings = await Booking.find({ owner: ownerId })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("getOwnerBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= CHANGE STATUS (OWNER / ADMIN) =======================
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: "Booking status updated", booking });
  } catch (error) {
    console.error("changeBookingStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= CANCEL BOOKING (USER) =======================
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.json({ success: false, message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    // make car available again
    await Car.findByIdAndUpdate(booking.car, {
      isAvailable: true
    });

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= GENERATE PDF =======================
export const generateBookingPDF = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate("car")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking_${bookingId}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Car Rental Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Customer Details");
    doc.fontSize(12).text(`Name: ${booking.user?.name || "N/A"}`);
    doc.text(`Email: ${booking.user?.email || "N/A"}`);
    doc.moveDown();

    doc.fontSize(14).text("Car Details");
    doc.fontSize(12).text(
      `Car: ${booking.car?.brand || ""} ${booking.car?.model || ""}`
    );
    doc.text(`Location: ${booking.car?.location || ""}`);
    doc.moveDown();

    doc.fontSize(14).text("Booking Details");
    doc.fontSize(12).text(
      `Rental Period: ${new Date(booking.pickupDate).toDateString()} → ${new Date(
        booking.returnDate
      ).toDateString()}`
    );
    doc.text(`Status: ${booking.status}`);
    doc.text(`Total Price: $${booking.price}`);
    doc.moveDown(2);

    doc.text("Thank you for choosing CarRental!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("generateBookingPDF error:", error);
    res.status(500).json({ success: false, message: "PDF generation failed" });
  }
};
