import { createFileRoute } from "@tanstack/react-router";
import { DonationsList } from "@/modules/donation/list/donations-list";

export const Route = createFileRoute("/donations/")({
  component: DonationsList,
});
