import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateTransportServiceForm } from "@/modules/transport-service/forms/create-transport-service";
import { BackToTransportServicesButton } from "@/modules/transport-service/forms/back-to-transport-services-button";

export const Route = createFileRoute("/transport-services/new")({
  component: NewTransportServicePage,
});

function NewTransportServicePage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/transport-services" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToTransportServicesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Create Transport Service
        </h2>
        <p className="text-gray-400 mt-1">Add a new transport service.</p>
      </div>

      <CreateTransportServiceForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
