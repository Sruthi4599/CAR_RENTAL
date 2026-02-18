import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const FakePayment = ({ amount, userId, carId, onSuccess }) => {
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        "https://car-rental-iybv.onrender.com/api/payment/fake-payment",
        { amount, userId, carId }
      );

      // ❌ No success alert here
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