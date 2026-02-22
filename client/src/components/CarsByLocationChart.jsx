import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from "recharts";

const CarsByLocationChart = ({ data }) => {

  // ✅ Ensure max 5 bars (frontend safety)
  const chartData = (data || [])
    .slice(0, 5)
    .map(item => ({
      location: item.location || item._id,
      totalCars: item.totalCars
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid stroke="#ede9f0" strokeDasharray="3 3" />

        <XAxis
          dataKey="location"
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.05)" }}
        />

        <Bar
          dataKey="totalCars"
          fill="#d2729cff"
          radius={[6, 6, 0, 0]}
        >
          {/* 🔥 Show value on top of bar */}
          <LabelList
            dataKey="totalCars"
            position="top"
          />
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  );
};

export default CarsByLocationChart;