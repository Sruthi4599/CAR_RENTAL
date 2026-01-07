import React, { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";

import ReservationsBarChart from "../../components/ReservationsBarChart";
import CarsByLocationChart from "../../components/CarsByLocationChart";
import RevenueLineChart from "../../components/RevenueLineChart";
import CarTypePieChart from "../../components/CarTypePieChart";

const Analysis = () => {
  const { axios, token, isOwner } = useAppContext();

  const [reservationData, setReservationData] = useState([]);
  const [carsByLocation, setCarsByLocation] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [carTypeData, setCarTypeData] = useState([]);

  const fetchReservationData = async () => {
    const res = await axios.get("/api/dashboard/reservations-over-time");
    if (res.data.success) setReservationData(res.data.data);
  };

  const fetchCarsByLocation = async () => {
    const res = await axios.get("/api/dashboard/cars-by-location");
    if (res.data.success) setCarsByLocation(res.data.data);
  };

  const fetchRevenueData = async () => {
    const res = await axios.get("/api/dashboard/revenue-over-time");
    if (res.data.success) setRevenueData(res.data.data);
  };

  const fetchCarTypeData = async () => {
    const res = await axios.get("/api/dashboard/most-booked-car-type");
    if (res.data.success) setCarTypeData(res.data.data);
  };

  useEffect(() => {
    if (token && isOwner) {
      fetchReservationData();
      fetchCarsByLocation();
      fetchRevenueData();
      fetchCarTypeData();
    }
  }, [token, isOwner]);

  return (
    <div className="px-4 pt-10 md:px-10 flex-1 bg-gray-50 min-h-screen">
      <Title
        title="Analysis"
        subTitle="Visual analytics of bookings, cars, revenue & demand"
      />

      {/* 🎨 2 x 2 DASHBOARD GRID */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Reservations */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4">
          <h2 className="text-sm font-semibold text-blue-600 mb-2">
            Reservations Over Time
          </h2>
          <div className="h-[320px]">
            <ReservationsBarChart data={reservationData} />
          </div>
        </div>

        {/* Cars by Location */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4">
          <h2 className="text-sm font-semibold text-indigo-600 mb-2">
            Cars by Location
          </h2>
          <div className="h-[320px]">
            <CarsByLocationChart data={carsByLocation} />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4">
          <h2 className="text-sm font-semibold text-green-600 mb-2">
            Revenue Over Time
          </h2>
          <div className="h-[320px]">
            <RevenueLineChart data={revenueData} />
          </div>
        </div>

        {/* Car Type */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4">
          <h2 className="text-sm font-semibold text-orange-600 mb-2">
            Most Booked Car Type
          </h2>
          <div className="h-[320px]">
            <CarTypePieChart data={carTypeData} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analysis;
