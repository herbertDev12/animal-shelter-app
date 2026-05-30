"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getProfitImpactData } from "../services";
import { DashboardEvent } from "../types";

interface ProfitImpactAnalysisProps {
  event?: DashboardEvent | null;
}

export function ProfitImpactAnalysis({ event }: ProfitImpactAnalysisProps) {
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ["profit-impact", event?.date],
    queryFn: () => getProfitImpactData({ eventDate: event!.date }),
    enabled: !!event?.date,
  });

  const maxYLimit = useMemo(() => {
    if (chartData.length === 0) return 0;
    const maxVal = Math.max(...chartData.map((d) => d.profit || 0));
    return Math.ceil(maxVal * 1.1);
  }, [chartData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="mb-10 bg-[#10131a] border-[#45484f]/10 p-4 relative overflow-hidden ring-0">
      <CardHeader className="flex flex-row justify-between items-start mb-6 px-4">
        <div>
          <CardTitle className="text-xl font-bold text-[#ecedf6] mb-1">
            Profit Impact Analysis {event ? `- ${event.name}` : ""}
          </CardTitle>
          <p className="text-sm text-[#a9abb3]">
            Cumulative profit trajectory for 60 days following the event.
          </p>
        </div>
        <div className="flex items-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#cc97ff]"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a9abb3]">
              Active Profit
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[400px] w-full relative px-4">
        {(isLoading || !event) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#10131a]/50 backdrop-blur-[2px] rounded-lg">
            <div className="w-8 h-8 border-4 border-[#cc97ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProfitImpact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cc97ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#cc97ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              domain={[0, maxYLimit]}
              tickFormatter={(val: number) => `$${val >= 1000 ? val / 1000 + "k" : val}`}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#fff" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [formatCurrency(Number(value) || 0), "Profit"]}
              labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#cc97ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfitImpact)"
              activeDot={{ r: 6, fill: "#cc97ff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
