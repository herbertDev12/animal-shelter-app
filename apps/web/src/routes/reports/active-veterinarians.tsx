import { createFileRoute } from "@tanstack/react-router";
import { ActiveVeterinariansComponent } from "../../modules/reports/active-veterinarians/active-veterinarians";

export const Route = createFileRoute("/reports/active-veterinarians")({
  component: ActiveVeterinariansPage,
});

function ActiveVeterinariansPage() {
  return <ActiveVeterinariansComponent />;
}
