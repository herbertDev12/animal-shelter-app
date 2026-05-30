import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { month: "Jan", value: 4570 },
  { month: "Feb", value: 3890 },
  { month: "Mar", value: 2790 },
  { month: "Apr", value: 1890 },
  { month: "May", value: 1490 },
  { month: "Jun", value: 990 },
  { month: "Jul", value: 1390 },
  { month: "Aug", value: 1990 },
  { month: "Sep", value: 1190 },
  { month: "Oct", value: 790 },
  { month: "Nov", value: 390 },
  { month: "Dec", value: 290 },
];

export function RevenueChart() {
  const [, setIsComparing] = useState(false);

  return (
    <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Total Profit</h3>
          <p className="text-sm text-gray-400 mt-1">
            Compare performance across years, months, or weeks
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select className="bg-[#161a21] border border-[#1a1f2e] text-white text-sm rounded-lg px-3 py-2 hover:border-[#2a2f3e] transition-colors">
            <option>Year</option>
            <option>Month</option>
            <option>Week</option>
          </select>
          <select className="bg-[#161a21] border border-[#1a1f2e] text-white text-sm rounded-lg px-3 py-2 hover:border-[#2a2f3e] transition-colors">
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
          </select>
          <button
            onClick={() => setIsComparing((prev) => !prev)}
            className="bg-[#161a21] border border-[#1a1f2e] text-white text-sm rounded-lg px-3 py-2 hover:border-[#2a2f3e] transition-colors flex items-center space-x-2"
          >
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            label={{
              value: "$",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#6b7280",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161a21",
              border: "1px solid #1a1f2e",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value) => `$${value}k`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#a78bfa"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
