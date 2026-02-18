import imageKit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
console.log("NEW ADD CAR CONTROLLER RUNNING");
/* ================= CHANGE ROLE TO OWNER ================= */
export const changeRoleToOwner = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.roles.includes("owner")) {
      user.roles.push("owner");
      await user.save();
    }

    res.json({
      success: true,
      message: "Owner access enabled"
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= ADD CAR ================= */
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;

    const car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Car image is required"
      });
    }

    // Upload image to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imageKit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/cars"
    });

    const optimizedImageURL = imageKit.url({
      path: response.filePath,
      transformation: [
        { width: "1280" },
        { quality: "auto" },
        { format: "webp" }
      ]
    });

    await Car.create({
      ...car,
      owner: _id,
      image: optimizedImageURL,
      isAvailable: true
    });

    res.json({ success: true, message: "Car Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message:"error" });
  }
};

/* ================= GET OWNER CARS ================= */
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.json({ success: true, cars });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= TOGGLE CAR AVAILABILITY ================= */
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({ success: true, message: "Availability toggled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= DELETE CAR ================= */
export const deletecar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    await Car.findByIdAndDelete(carId);

    res.json({
      success: true,
      message: "Car deleted successfully"
    });
  } catch (error) {
    console.error("Delete car error:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= OWNER DASHBOARD DATA ================= */
export const getDashboardData = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const totalCars = await Car.countDocuments({ owner: ownerId });
    const totalBookings = await Booking.countDocuments({ owner: ownerId });
    const pendingBookings = await Booking.countDocuments({
      owner: ownerId,
      status: "pending"
    });
    const completedBookings = await Booking.countDocuments({
      owner: ownerId,
      status: "confirmed"
    });

    const recentBookings = await Booking.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("car");

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const monthlyBookings = await Booking.find({
      owner: ownerId,
      status: "confirmed",
      createdAt: { $gte: startOfMonth }
    });

    const monthlyRevenue = monthlyBookings.reduce(
      (sum, b) => sum + b.price,
      0
    );

    res.json({
      success: true,
      dashboardData: {
        totalCars,
        totalBookings,
        pendingBookings,
        completedBookings,
        recentBookings,
        monthlyRevenue
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= UPDATE USER IMAGE ================= */
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imageKit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/users"
    });

    const optimizedImageURL = imageKit.url({
      path: response.filePath,
      transformation: [
        { width: "400" },
        { quality: "auto" },
        { format: "webp" }
      ]
    });

    await User.findByIdAndUpdate(_id, { image: optimizedImageURL });

    res.json({ success: true, message: "Image updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
