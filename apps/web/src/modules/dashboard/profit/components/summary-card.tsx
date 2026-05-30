import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
}

export function SummaryCard({ title, value, trend, icon: Icon, color }: SummaryCardProps) {
  return (
    <div className="bg-[#161a21] p-6 rounded-xl border border-gray-800/50 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`text-${color}-500`} size={20} />
        </div>
        <span
          className={`text-[10px] font-bold ${trend.startsWith("+") ? "text-green-400" : "text-red-400"} bg-${trend.startsWith("+") ? "green" : "red"}-500/10 px-2 py-1 rounded-full`}
        >
          {trend}
        </span>
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
