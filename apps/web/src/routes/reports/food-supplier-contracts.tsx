import { createFileRoute } from "@tanstack/react-router";
import { FoodSupplierContractsComponent } from "../../modules/reports/food-supplier-contracts/food-supplier-contracts";

export const Route = createFileRoute("/reports/food-supplier-contracts")({
  component: FoodSupplierContractsPage,
});

function FoodSupplierContractsPage() {
  return <FoodSupplierContractsComponent />;
}
