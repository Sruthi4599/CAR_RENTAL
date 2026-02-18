import crypto from "crypto";

export const fakePayment = async (req, res) => {
  try {
    console.log("🔥 PAYMENT API HIT - Request received");
    console.log("Request Body:", req.body);
    console.log("Headers:", req.headers);
    
    const { amount, userId, carId } = req.body;
    console.log(amount +  "," + userId + "," + carId);
    // Validate required fields
    if (!amount || !userId || !carId) {
      console.log("❌ Missing fields:", { amount, userId, carId });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: amount, userId, or carId"
      });
    }
    if (Number(age) < 18) {
      return res.status(400).json({
        success: false,
        message: "You must be at least 18 years old to make payment"
      });
    }

    // Generate a fake transaction ID
    const transactionId = `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    console.log("✅ Processing payment:", {
      amount,
      userId,
      carId,
      transactionId
    });
    
    // Simulate successful payment
    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      transactionId: transactionId,
      amount: amount,
      userId: userId,
      carId: carId,
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