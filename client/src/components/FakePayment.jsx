import { useState } from "react";
import { useAppContext } from "../context/AppContext";  // ✅ import context

const FakePayment = ({ amount, userId, carId, onSuccess }) => {
  const { axios } = useAppContext();   // ✅ use axios from context
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/payment/fake-payment",
        { amount, userId, carId }
      );

      alert("Payment Successful ✅");

      // Send payment status to booking creation
      onSuccess({
        ...res.data,
        status: "PAID"
      });

    } catch (err) {
      console.error("❌ Payment error:", err);

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
      className="px-4 py-2 bg-green-600 text-white rounded-md w-full"
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
};

export default FakePayment;