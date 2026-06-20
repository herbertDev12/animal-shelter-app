import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateActivityScheduleForm } from "@/modules/activity-schedule/forms/create-activity-schedule";
import { BackToActivitySchedulesButton } from "@/modules/activity-schedule/forms/back-to-activity-schedules-button";

export const Route = createFileRoute("/activity-schedules/new")({
  component: NewActivitySchedulePage,
});

function NewActivitySchedulePage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/activity-schedules" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToActivitySchedulesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Create Activity Schedule
        </h2>
        <p className="text-gray-400 mt-1">Add a new activity schedule.</p>
      </div>

      <CreateActivityScheduleForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
