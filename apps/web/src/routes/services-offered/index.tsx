import { createFileRoute } from "@tanstack/react-router";
import { ServicesOfferedList } from "@/modules/service-offered/list/services-offered-list";

export const Route = createFileRoute("/services-offered/")({
  component: ServicesOfferedList,
});
