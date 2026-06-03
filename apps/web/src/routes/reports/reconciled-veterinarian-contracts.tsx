import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/reports/reconciled-veterinarian-contracts",
)({
  component: ReconciledVeterinarianContractsComponent,
});

function ReconciledVeterinarianContractsComponent() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Reconciled Veterinarian Contracts
        </h2>
        <p className="text-gray-400 mt-1">
          View and manage reconciled contracts for shelter veterinarians.
        </p>
      </div>
      <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-xl p-6">
        <p className="text-gray-400">
          Reconciled veterinarian contracts content coming soon...
        </p>
      </div>
    </div>
  );
}
