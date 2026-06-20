import { createFileRoute } from "@tanstack/react-router";
import { ActivitySchedulesList } from "@/modules/activity-schedule/list/activity-schedules-list";

export const Route = createFileRoute("/activity-schedules/")({
  component: ActivitySchedulesList,
});
