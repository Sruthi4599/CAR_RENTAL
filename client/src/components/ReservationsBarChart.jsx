import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const monthNames = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const ReservationsBarChart = ({ data }) => {
  const formattedData = data.map(item => ({
    month: `${monthNames[item._id.month]} ${item._id.year}`,
    reservations: item.totalReservations
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formattedData}>
        <CartesianGrid stroke="#ede9f0" strokeDasharray="3 3" />

        <XAxis
          dataKey="month"
          tick={{ fill: "#6B7280", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6B7280", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "12px"
          }}
        />

        <Bar
          dataKey="reservations"
          fill="#3f596bff"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ReservationsBarChart;
