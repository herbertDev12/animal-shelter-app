import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditActivityForm } from "@/modules/activity/forms/edit-activity";
import { BackToActivitiesButton } from "@/modules/activity/forms/back-to-activities-button";
import { fetchActivity } from "@/modules/activity/services";

export const Route = createFileRoute("/activities/$activityId/edit")({
  component: EditActivityPage,
});

function EditActivityPage() {
  const { activityId } = Route.useParams();
  const id = Number(activityId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/activities" });

  const {
    data: activity,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => fetchActivity(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToActivitiesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Activity</h2>
        <p className="text-gray-400 mt-1">
          Update this activity's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading activity...</p>
        </div>
      ) : isError || !activity ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Activity not found.</p>
        </div>
      ) : (
        <EditActivityForm
          activity={activity}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
