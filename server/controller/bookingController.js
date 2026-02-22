import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import { calculateDynamicPrice } from "../utils/pricingEngine.js";
import checkAvailability from "../utils/checkAvailability.js";
import PDFDocument from "pdfkit";
import { getRefundPercentage } from "../utils/refundCalculator.js";
import imagekit from "../configs/imageKit.js";
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
    const {
  carId,
  pickupDate,
  returnDate
} = req.body;

let customerDetails;

try {
  customerDetails =
    typeof req.body.customerDetails === "string"
      ? JSON.parse(req.body.customerDetails)
      : req.body.customerDetails;
} catch {
  return res.status(400).json({
    success:false,
    message:"Invalid customer details"
  });
}
    if (!req.file) {
  return res.status(400).json({
    success:false,
    message:"Driving license required"
  });
}
    if (
      !customerDetails ||
      !customerDetails.fullName ||
      !customerDetails.age ||
      !customerDetails.gender||
      !customerDetails.location
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer name, age and gender are required"
      });
    }

    if (!carId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (customerDetails.age < 18) {
  return res.status(400).json({
    success: false,
    message: "You must be at least 18 years old to book a car."
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
    const result = await imagekit.upload({
  file: req.file.buffer,
  fileName: `license_${Date.now()}`,
});

const licenseDocument = result.url;
    const booking = await Booking.create({
      user: req.user._id,
      owner: car.owner,
      car: carId,
      pickupDate: pickup,
      returnDate: ret,
      price: pricing.totalPrice,
      customerDetails,   // ✅ NEW
      licenseDocument,
      status: "pending",
      paymentStatus: "pending"
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
  booking.paymentStatus = refundPercent > 0 ? "refunded" : "paid";
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
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const newReturn = new Date(returnDate);
  const currentReturn = new Date(booking.returnDate);

  // ✅ ENFORCE NEXT-DAY EXTENSION
  const minExtendDate = new Date(currentReturn);
  minExtendDate.setDate(minExtendDate.getDate() + 1);

  if (newReturn < minExtendDate) {
    return res.status(400).json({
      success: false,
      message: "Extension date must be after current return date"
    });
  }

  // ✅ CHECK AVAILABILITY ONLY FOR EXTENSION PERIOD
  const available = await checkAvailability(
    booking.car._id,
    currentReturn,
    newReturn,
    booking._id
  );

  if (!available) {
    return res.status(400).json({
      success: false,
      message: "Car not available for extension"
    });
  }

  // 🔥 CALCULATE PRICE ONLY FOR EXTRA DAYS
  const pricing = await calculateDynamicPrice(
    booking.car,
    currentReturn,
    newReturn
  );

  const extraAmount = pricing.totalPrice;

  // 💰 REQUIRE PAYMENT FOR EXTENSION
  if (extraAmount > 0 && !payment) {
    return res.status(400).json({
      success: false,
      message: "Additional payment required",
      extraAmount
    });
  }

  // ✅ UPDATE BOOKING
  booking.returnDate = newReturn;
  booking.price += extraAmount;
  await booking.save();

  res.json({
    success: true,
    message: "Booking extended successfully",
    extraAmount
  });
};

export const generateBookingPDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("car")
      .populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // 🔐 Only booking owner (user) can download PDF
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking_${booking._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    /* ===== TITLE ===== */
    doc.fontSize(22).text("Car Rental Booking Receipt", {
      align: "center"
    });
    doc.moveDown(2);

    /* ===== BOOKING DETAILS ===== */
    /* ===== BOOKING DETAILS ===== */
    doc.fontSize(12);
    doc.text(`Booking ID: ${booking._id}`);
    doc.text(
  `Booked By (Account): ${booking.user?.name || "N/A"}`
);

doc.text(
  `Booking For: ${booking.customerDetails?.fullName || "N/A"}`
);

    doc.text(`Customer Age: ${booking.customerDetails.age}`);
    doc.text(`Customer Gender: ${booking.customerDetails.gender}`);
    doc.text(`Booking Location: ${booking.customerDetails.location}`); 
    doc.text(`Customer Email: ${booking.user.email}`);
    doc.moveDown();


    /* ===== CAR DETAILS ===== */
    doc.text(
      `Car: ${booking.car.brand} ${booking.car.model} (${booking.car.year})`
    );
    doc.text(`Fuel Type: ${booking.car.fuel_type}`);
    doc.text(`Transmission: ${booking.car.transmission}`);
    doc.text(`Location: ${booking.car.location}`);
    doc.moveDown();

    /* ===== DATE DETAILS ===== */
    doc.text(
      `Pickup Date: ${new Date(booking.pickupDate).toDateString()}`
    );
    doc.text(
      `Return Date: ${new Date(booking.returnDate).toDateString()}`
    );
    doc.moveDown();

    /* ===== PAYMENT DETAILS ===== */
    doc.fontSize(14).text(`Total Price: ₹${booking.price}`, {
      bold: true
    });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Payment Status: ${booking.paymentStatus}`);
    doc.text(`Booking Status: ${booking.status}`);

    if (booking.status === "cancelled") {
      doc.moveDown();
      doc.text(`Cancelled By: ${booking.cancelledBy}`);
      doc.text(`Refund Amount: ₹${booking.refundAmount}`);
    }

    doc.moveDown(2);

    /* ===== FOOTER ===== */
    doc
      .fontSize(10)
      .text(
        "Thank you for booking with us.\nDrive safely!",
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate booking PDF"
    });
  }
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
