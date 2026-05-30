import { RevenueChart } from "./components/revenue-chart";

export default function ProfitPage() {
  return (
    <main className="ml-64 pt-10 p-8">
      <div className="max-w-7xl mx-auto space-y-8 pt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-gray-400 mt-1">Here’s what’s happening with SocIA lately..</p>
          </div>
        </div>
        <RevenueChart />
      </div>
    </main>
  );
}
