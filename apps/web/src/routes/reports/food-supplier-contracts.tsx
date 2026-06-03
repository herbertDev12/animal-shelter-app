import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reports/food-supplier-contracts")({
  component: FoodSupplierContractsComponent,
});

function FoodSupplierContractsComponent() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Food Supplier Contracts
        </h2>
        <p className="text-gray-400 mt-1">
          Track and manage food supplier contracts and agreements.
        </p>
      </div>
      <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-xl p-6">
        <p className="text-gray-400">
          Food supplier contracts content coming soon...
        </p>
      </div>
    </div>
  );
}
