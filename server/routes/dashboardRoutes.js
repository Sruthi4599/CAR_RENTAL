import express from "express";
import {
  reservationsOverTime,
  carsByLocation,
  revenueOverTime,
  mostBookedCarType
} from "../controller/dashboardController.js";

const router = express.Router();

router.get("/reservations-over-time", reservationsOverTime);
router.get("/cars-by-location", carsByLocation);
router.get("/revenue-over-time", revenueOverTime);
router.get("/most-booked-car-type", mostBookedCarType); // ✅ NEW

export default router;
