import { createFileRoute } from "@tanstack/react-router";
import { ClinicsList } from "@/modules/clinic/list/clinics-list";

export const Route = createFileRoute("/clinics/")({
  component: ClinicsList,
});
