import { createFileRoute } from "@tanstack/react-router";
import { AnimalsList } from "@/modules/animal/list/animals-list";

export const Route = createFileRoute("/animals/")({
  component: AnimalsList,
});
