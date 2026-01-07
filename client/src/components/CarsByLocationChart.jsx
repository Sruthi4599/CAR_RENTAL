import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const CarsByLocationChart = ({ data }) => {
  const chartData = data.map(item => ({
    location: item._id,
    totalCars: item.totalCars
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid stroke="#ede9f0" strokeDasharray="3 3" />
        <XAxis dataKey="location" axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar
          dataKey="totalCars"
          fill="#d2729cff"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CarsByLocationChart;
