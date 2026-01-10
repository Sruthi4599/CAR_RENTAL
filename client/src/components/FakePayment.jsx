import axios from "axios";
import { useState } from "react";

const FakePayment = ({ amount, userId, carId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
  "http://localhost:3000/api/payment/fake-payment",
  { amount, userId, carId }
);


      alert("Payment Successful ✅");
      onSuccess(res.data);
    } catch (err) {
  console.error("❌ Payment error full:", err);
  console.error("❌ Response:", err.response);
  console.error("❌ Message:", err.message);

  alert(
    err.response?.data?.message ||
    err.message ||
    "Payment Failed ❌"
  );

    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        padding: "10px 20px",
        background: "#16a34a",
        color: "white",
        borderRadius: "6px",
      }}
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
};

export default FakePayment;
