import { createFileRoute } from "@tanstack/react-router";
import { AdoptionsList } from "@/modules/adoption/list/adoptions-list";

export const Route = createFileRoute("/adoptions/")({
  component: AdoptionsList,
});
