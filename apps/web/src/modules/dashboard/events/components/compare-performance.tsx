import { ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

export function ComparePerformance() {
  return (
    <div className="col-span-5">
      <h4 className="text-sm font-black text-[#a9abb3] uppercase tracking-[0.2em] mb-6">
        Compare Performance
      </h4>
      <Card className="bg-[#1c2028] border-[#45484f]/5 rounded-3xl ring-0">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#a9abb3] uppercase mb-2 block">
                Source Event
              </span>
              <Select defaultValue="v2.0">
                <SelectTrigger className="w-full bg-[#10131a] border-[#45484f]/10 text-[#ecedf6] h-10 px-3 rounded-xl">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2.0">v2.0 Release</SelectItem>
                  <SelectItem value="api">API Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-2 shrink-0">
              <ArrowRightLeft className="w-5 h-5 text-[#a9abb3]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#a9abb3] uppercase mb-2 block">
                Target Event
              </span>
              <Select defaultValue="marketing">
                <SelectTrigger className="w-full bg-[#10131a] border-[#cc97ff]/40 text-[#ecedf6] h-10 px-3 rounded-xl">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing Campaign</SelectItem>
                  <SelectItem value="ui">UI Refresh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[#a9abb3]">Profit Velocity Delta</span>
                <span className="text-[#53ddfc]">+12.4%</span>
              </div>
              <Progress value={72} className="h-1.5 bg-[#0b0e14] rounded-full overflow-hidden">
                <ProgressTrack className="h-full w-full bg-[#0b0e14]">
                  <ProgressIndicator className="bg-[#53ddfc]" />
                </ProgressTrack>
              </Progress>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[#a9abb3]">Engagement Retention</span>
                <span className="text-[#cc97ff]">+8.1%</span>
              </div>
              <Progress value={58} className="h-1.5 bg-[#0b0e14] rounded-full overflow-hidden">
                <ProgressTrack className="h-full w-full bg-[#0b0e14]">
                  <ProgressIndicator className="bg-[#cc97ff]" />
                </ProgressTrack>
              </Progress>
            </div>
          </div>

          <Button className="w-full mt-6 h-12 border border-[#45484f]/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-[#ecedf6] bg-transparent">
            Generate Delta Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
