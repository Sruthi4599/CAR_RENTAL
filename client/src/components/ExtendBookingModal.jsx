import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppContext } from "../context/AppContext";

const ExtendBookingModal = ({ booking, onClose, onExtended }) => {
  const { axios } = useAppContext();

  const [newReturnDate, setNewReturnDate] = useState(
    new Date(booking.returnDate)
  );
  const [disabledDates, setDisabledDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH UNAVAILABLE DATES ================= */
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const { data } = await axios.get(
          `/api/bookings/unavailable-dates/${booking.car._id}`
        );

        if (data.success) {
          setDisabledDates(
            data.disabledDates.map((d) => new Date(d))
          );
        }
      } catch (error) {
        console.error("Failed to fetch unavailable dates");
      }
    };

    fetchUnavailableDates();
  }, [booking.car._id, axios]);

  /* ================= EXTEND BOOKING ================= */
  const handleExtend = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { data } = await axios.put(
        `/api/bookings/extend/${booking._id}`,
        {
          returnDate: newReturnDate.toISOString().split("T")[0],
        }
      );

      if (data.success) {
        setMessage("Booking extended successfully!");
        onExtended(newReturnDate.toISOString().split("T")[0]);
      } else {
        setMessage(data.message || "Failed to extend booking");
      }
    } catch (error) {
      console.error(error.response?.data);
      setMessage(
        error.response?.data?.message || "Failed to extend booking"
      );
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
          Current return date:{" "}
          {booking.returnDate.split("T")[0]}
        </p>

        {/* DATE PICKER */}
        <DatePicker
          selected={newReturnDate}
          onChange={(date) => setNewReturnDate(date)}
          minDate={new Date(booking.returnDate)}
          excludeDates={disabledDates}
          dateFormat="yyyy-MM-dd"
          className="border px-2 py-1 rounded-md w-full mb-4"
        />

        <button
          onClick={handleExtend}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white w-full mb-2 ${
            loading
              ? "bg-gray-400"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {loading ? "Extending..." : "Extend"}
        </button>

        {message && (
          <p className="mt-2 text-center text-sm">{message}</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-md w-full hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExtendBookingModal;
