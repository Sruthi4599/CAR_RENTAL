import crypto from "crypto";

export const fakePayment = async (req, res) => {
  try {
    console.log("🔥 PAYMENT API HIT - Request received");

    const { amount, userId, carId } = req.body;

    // Validate required fields
    if (!amount || !userId || !carId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: amount, userId, or carId"
      });
    }

    // Generate fake transaction ID
    const transactionId = `TXN_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      transactionId,
      amount,
      userId,
      carId,
      status: "COMPLETED",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Payment processing error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error during payment processing"
    });
  }
};