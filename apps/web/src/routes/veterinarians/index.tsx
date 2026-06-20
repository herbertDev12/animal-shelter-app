import { createFileRoute } from "@tanstack/react-router";
import { VeterinariansList } from "@/modules/veterinarian/list/veterinarians-list";

export const Route = createFileRoute("/veterinarians/")({
  component: VeterinariansList,
});
