import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppContext } from "../context/AppContext";
import FakePayment from "./FakePayment";
import toast from "react-hot-toast";

const ExtendBookingModal = ({ booking, onClose, onExtended }) => {
  const { axios, currency } = useAppContext();

  const [newReturnDate, setNewReturnDate] = useState(
    new Date(booking.returnDate)
  );
  const [disabledDates, setDisabledDates] = useState([]);
  const [extraAmount, setExtraAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH UNAVAILABLE DATES ================= */
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const { data } = await axios.get(
  `/api/bookings/unavailable-dates/${booking.car._id}?bookingId=${booking._id}`
);
        if (data.success) {
          setDisabledDates(data.disabledDates.map((d) => new Date(d)));
        }
      } catch {
        toast.error("Failed to fetch unavailable dates");
      }
    };
    fetchUnavailableDates();
  }, [booking.car._id, axios]);

  /* ================= HANDLE EXTEND ================= */
  const handleExtend = async (paymentData = null) => {
    try {
      setLoading(true);

      const { data } = await axios.put(
        `/api/bookings/extend/${booking._id}`,
        {
          returnDate: newReturnDate.toISOString().split("T")[0],
          payment: paymentData
        }
      );

      if (data.success) {
        toast.success("Booking extended successfully");
        onExtended(newReturnDate.toISOString().split("T")[0]);
        onClose();
      }
    } catch (error) {
      // 🔥 Backend sends extraAmount if payment required
      if (error.response?.data?.extraAmount !== undefined) {
        setExtraAmount(error.response.data.extraAmount);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to extend booking"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Extend Booking</h2>

        <p className="mb-2">
          Car: {booking.car.brand} {booking.car.model}
        </p>

        <p className="mb-2">
          Current return date: {booking.returnDate.split("T")[0]}
        </p>

        {/* DATE PICKER */}
        <DatePicker
          selected={newReturnDate}
          onChange={(date) => {
            setNewReturnDate(date);
            setExtraAmount(null); // reset when date changes
          }}
          minDate={new Date(booking.returnDate)}
          excludeDates={disabledDates}
          dateFormat="yyyy-MM-dd"
          className="border px-2 py-1 rounded-md w-full mb-4"
        />

        {/* EXTRA PAYMENT */}
        {extraAmount !== null && extraAmount > 0 && (
          <p className="mb-3 text-sm">
            Additional amount to pay:{" "}
            <span className="font-semibold text-green-600">
              {currency}{extraAmount}
            </span>
          </p>
        )}

        {/* ACTION */}
        {extraAmount > 0 ? (
          <FakePayment
            amount={extraAmount}
            onSuccess={(paymentData) => handleExtend(paymentData)}
          />
        ) : (
          <button
            onClick={() => handleExtend()}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md w-full hover:bg-yellow-600"
          >
            {loading ? "Extending..." : "Extend"}
          </button>
        )}

        <button
          onClick={onClose}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-md w-full hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExtendBookingModal;
