import { createFileRoute } from "@tanstack/react-router";
import { RevenueChart } from "../components/dashboard/revenue-chart";

export const Route = createFileRoute("/")({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your shelter lately.
          </p>
        </div>
      </div>
      <RevenueChart />
    </div>
  );
}
