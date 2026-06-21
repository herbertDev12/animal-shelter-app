import { createFileRoute } from "@tanstack/react-router";
import { ActivitiesList } from "@/modules/activity/list/activities-list";

export const Route = createFileRoute("/activities/")({
  component: ActivitiesList,
});
