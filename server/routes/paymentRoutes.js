import express from "express";
import { fakePayment } from "../controller/paymentController.js";

const router = express.Router();

// ✅ allow preflight

// ✅ actual payment
router.post("/fake-payment", fakePayment);

export default router;