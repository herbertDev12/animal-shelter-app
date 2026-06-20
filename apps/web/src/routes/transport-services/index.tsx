import { createFileRoute } from "@tanstack/react-router";
import { TransportServicesList } from "@/modules/transport-service/list/transport-services-list";

export const Route = createFileRoute("/transport-services/")({
  component: TransportServicesList,
});
