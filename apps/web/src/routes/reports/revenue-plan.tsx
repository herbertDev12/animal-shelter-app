import { createFileRoute } from "@tanstack/react-router";
import { RevenuePlanComponent } from "../../modules/reports/revenue-plan/revenue-plan";

export const Route = createFileRoute("/reports/revenue-plan")({
  component: RevenuePlanPage,
});

function RevenuePlanPage() {
  return <RevenuePlanComponent />;
}
