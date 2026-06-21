import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateActivityForm } from "@/modules/activity/forms/create-activity";
import { BackToActivitiesButton } from "@/modules/activity/forms/back-to-activities-button";

export const Route = createFileRoute("/activities/new")({
  component: NewActivityPage,
});

function NewActivityPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/activities" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToActivitiesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Activity</h2>
        <p className="text-gray-400 mt-1">Add a new activity.</p>
      </div>

      <CreateActivityForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
