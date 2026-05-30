"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getRevenueChartData } from "../services";
import { FilterType } from "@/modules/dashboard/profit/types";

export function RevenueChart() {
  const [filterType, setFilterType] = useState<FilterType>("year");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [isComparing, setIsComparing] = useState(false);
  const [comparePeriod, setComparePeriod] = useState<string>(
    (new Date().getFullYear() - 1).toString(),
  );

  const periodOptions = useMemo(
    () => generatePeriods(filterType),
    [filterType],
  );

  const { data: baseData = [], isLoading: isLoadingBase } = useQuery({
    queryKey: ["revenue", filterType, selectedPeriod],
    queryFn: () => getRevenueChartData(filterType, selectedPeriod),
    enabled: !!selectedPeriod,
  });

  const { data: compareData = [], isLoading: isLoadingCompare } = useQuery({
    queryKey: ["revenue", filterType, comparePeriod],
    queryFn: () => getRevenueChartData(filterType, comparePeriod),
    enabled: isComparing && !!comparePeriod,
  });

  const isLoading = isLoadingBase || isLoadingCompare;

  const handleFilterTypeChange = (val: string | null) => {
    if (!val) return;
    const filterVal = val as FilterType;
    setFilterType(filterVal);
    const newOptions = generatePeriods(filterVal);
    if (newOptions.length > 0) {
      setSelectedPeriod(newOptions[0].id);
      if (newOptions.length > 1) {
        setComparePeriod(newOptions[1].id);
      } else {
        setComparePeriod(newOptions[0].id);
      }
    }
  };

  const chartData = useMemo(() => {
    return baseData.map((item, index) => ({
      label: item.label,
      profit: item.profit,
      compareProfit:
        isComparing && compareData[index] ? compareData[index].profit : null,
    }));
  }, [baseData, compareData, isComparing]);

  const maxYLimit = useMemo(() => {
    if (chartData.length === 0) return 0;
    const maxVal = Math.max(
      ...chartData.map((d) => Math.max(d.profit || 0, d.compareProfit || 0)),
    );
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
    <div className="bg-[#161a21] rounded-2xl p-8 border border-gray-800/50 flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Total Profit</h3>
          <p className="text-sm text-gray-400">
            Compare performance across years, months, or weeks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterType}
            onValueChange={(val) => handleFilterTypeChange(val as string)}
          >
            <SelectTrigger className="w-[120px] bg-[#161a21] border-gray-700 text-white capitalize">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedPeriod}
            onValueChange={(val) => setSelectedPeriod((val as string) || "")}
          >
            <SelectTrigger className="w-[200px] bg-[#161a21] border-gray-700 text-white">
              <SelectValue placeholder="Period">
                <span className="block truncate">
                  {periodOptions.find((opt) => opt.id === selectedPeriod)
                    ?.label || "Select period"}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 ml-2">
            <Switch
              checked={isComparing}
              onCheckedChange={setIsComparing}
              id="compare-mode"
            />
            <label
              htmlFor="compare-mode"
              className="text-sm text-gray-300 select-none cursor-pointer"
            >
              Compare
            </label>
          </div>

          {isComparing && (
            <Select
              value={comparePeriod}
              onValueChange={(val) => setComparePeriod((val as string) || "")}
            >
              <SelectTrigger className="w-[200px] bg-[#161a21] border-gray-700 text-white">
                <SelectValue placeholder="Compare to">
                  <span className="block truncate">
                    {periodOptions.find((opt) => opt.id === comparePeriod)
                      ?.label || "Select period"}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="h-[350px] w-full mt-4 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#161a21]/50 backdrop-blur-[1px] rounded-lg">
            <div className="w-8 h-8 border-4 border-[#cc97ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cc97ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#cc97ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#53ddfc" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#53ddfc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              domain={[0, maxYLimit]}
              tickFormatter={(val: number) =>
                `$${val >= 1000 ? val / 1000 + "k" : val}`
              }
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
              formatter={(value: any, name: any) => [
                formatCurrency(Number(value) || 0),
                name === "profit" ? "Profit" : "Compared Profit",
              ]}
              labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#cc97ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
              activeDot={{ r: 6, fill: "#cc97ff" }}
            />
            {isComparing && (
              <Area
                type="monotone"
                dataKey="compareProfit"
                stroke="#53ddfc"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorCompare)"
                activeDot={{ r: 6, fill: "#53ddfc" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
