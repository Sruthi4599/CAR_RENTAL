import crypto from "crypto";

export const fakePayment = (req, res) => {
  console.log("🔥 PAYMENT API HIT");
  res.json({ success: true });
};

   