import express from "express";
import { fakePayment } from "../controller/paymentController.js";

const router = express.Router();

// ✅ allow preflight
router.options("/fake-payment", (req, res) => {
  res.sendStatus(200);
});

// ✅ actual payment
router.post("/fake-payment", fakePayment);

export default router;