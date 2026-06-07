import { createFileRoute } from "@tanstack/react-router";
import { ComplementaryServiceContractsComponent } from "../../modules/reports/complementary-service-contracts/complementary-service-contracts";

export const Route = createFileRoute(
  "/reports/complementary-service-contracts",
)({
  component: ComplementaryServiceContractsPage,
});

function ComplementaryServiceContractsPage() {
  return <ComplementaryServiceContractsComponent />;
}
