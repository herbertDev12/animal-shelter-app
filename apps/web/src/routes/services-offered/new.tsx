import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateServiceOfferedForm } from "@/modules/service-offered/forms/create-service-offered";
import { BackToServicesButton } from "@/modules/service-offered/forms/back-to-services-button";

export const Route = createFileRoute("/services-offered/new")({
  component: NewServiceOfferedPage,
});

function NewServiceOfferedPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/services-offered" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToServicesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Create Service Offered
        </h2>
        <p className="text-gray-400 mt-1">Add a new service offered.</p>
      </div>

      <CreateServiceOfferedForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
