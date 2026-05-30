import { TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AutomatedInsights() {
  return (
    <div className="col-span-7">
      <h4 className="text-sm font-black text-[#a9abb3] uppercase tracking-[0.2em] mb-6">
        Automated Insights
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#22262f]/60 backdrop-blur-[20px] rounded-2xl border-[#45484f]/10 group hover:border-[#cc97ff]/30 transition-colors duration-300 ring-0">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-[#cc97ff]/10 flex items-center justify-center text-[#cc97ff] mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm text-[#ecedf6] leading-relaxed">
              After <span className="text-[#cc97ff] font-bold">v2.0 Release</span>, profit increased
              by <span className="text-[#53ddfc] font-bold">22%</span> in the following 30 days
              compared to previous baseline.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#22262f]/60 backdrop-blur-[20px] rounded-2xl border-[#45484f]/10 group hover:border-[#53ddfc]/30 transition-colors duration-300 ring-0">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-[#53ddfc]/10 flex items-center justify-center text-[#53ddfc] mb-4">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <p className="text-sm text-[#ecedf6] leading-relaxed">
              <span className="font-bold">API Update</span> reduced latency by 45ms, leading to a{" "}
              <span className="text-[#53ddfc] font-bold">4.2% lift</span> in checkout conversion
              rates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
