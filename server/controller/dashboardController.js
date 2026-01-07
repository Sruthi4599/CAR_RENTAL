import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

/* ===============================
   1️⃣ Reservations Over Time
   =============================== */
export const reservationsOverTime = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalReservations: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   2️⃣ Cars By Location
   =============================== */
export const carsByLocation = async (req, res) => {
  try {
    const data = await Car.aggregate([
      {
        $group: {
          _id: "$location",
          totalCars: { $sum: 1 }
        }
      },
      {
        $sort: { totalCars: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   3️⃣ Revenue / Gross Profit Over Time
   =============================== */
export const revenueOverTime = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        // change this if you use paymentStatus = "PAID"
        $match: { status: "confirmed" }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$price" } // change to "$totalPrice" if needed
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   4️⃣ Most Booked Car Type
   =============================== */
export const mostBookedCarType = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $match: { status: "confirmed" } // adjust if you use PAID
      },
      {
        $lookup: {
          from: "cars",          // MongoDB collection name
          localField: "car",
          foreignField: "_id",
          as: "carDetails"
        }
      },
      { $unwind: "$carDetails" },
      {
        $group: {
          _id: "$carDetails.category", // SUV / Sedan / Hatchback
          totalBookings: { $sum: 1 }
        }
      },
      {
        $sort: { totalBookings: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
