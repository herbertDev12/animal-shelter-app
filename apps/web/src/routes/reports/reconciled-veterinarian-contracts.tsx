import { createFileRoute } from "@tanstack/react-router";
import { ReconciledVeterinarianContractsComponent } from "@/modules/reports/reconciled-veterinarian-contracts/reconciled-veterinarian-contracts";

export const Route = createFileRoute(
  "/reports/reconciled-veterinarian-contracts",
)({
  component: ReconciledVeterinarianContractsPage,
});

function ReconciledVeterinarianContractsPage() {
  return <ReconciledVeterinarianContractsComponent />;
}
