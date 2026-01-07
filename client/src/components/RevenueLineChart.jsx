import {
  LineChart,
  Line,
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

const RevenueLineChart = ({ data }) => {
  const chartData = data.map(item => ({
    month: `${monthNames[item._id.month]} ${item._id.year}`,
    revenue: item.totalRevenue
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid stroke="#ede9f0" strokeDasharray="3 3" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip />
        <Line
          type="natural"
          dataKey="revenue"
          stroke="#A376A2"
          strokeWidth={3}
          dot={{ r: 4, fill: "#DDC3C3" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueLineChart;
