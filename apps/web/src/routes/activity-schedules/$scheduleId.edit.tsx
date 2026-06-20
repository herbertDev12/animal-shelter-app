import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditActivityScheduleForm } from "@/modules/activity-schedule/forms/edit-activity-schedule";
import { BackToActivitySchedulesButton } from "@/modules/activity-schedule/forms/back-to-activity-schedules-button";
import { fetchActivitySchedule } from "@/modules/activity-schedule/services";

export const Route = createFileRoute("/activity-schedules/$scheduleId/edit")({
  component: EditActivitySchedulePage,
});

function EditActivitySchedulePage() {
  const { scheduleId } = Route.useParams();
  const id = Number(scheduleId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/activity-schedules" });

  const {
    data: schedule,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activity-schedule", id],
    queryFn: () => fetchActivitySchedule(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToActivitySchedulesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Edit Activity Schedule
        </h2>
        <p className="text-gray-400 mt-1">
          Update this activity schedule's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading activity schedule...</p>
        </div>
      ) : isError || !schedule ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Activity schedule not found.</p>
        </div>
      ) : (
        <EditActivityScheduleForm
          schedule={schedule}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
