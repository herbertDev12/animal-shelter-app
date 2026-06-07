import { createFileRoute } from "@tanstack/react-router";
import { AnimalCareScheduleComponent } from "../../modules/reports/animal-care-schedule/animal-care-schedule";

export const Route = createFileRoute("/reports/animal-care-schedule")({
  component: AnimalCareSchedulePage,
});

function AnimalCareSchedulePage() {
  return <AnimalCareScheduleComponent />;
}
