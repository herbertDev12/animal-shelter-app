import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditTransportServiceForm } from "@/modules/transport-service/forms/edit-transport-service";
import { BackToTransportServicesButton } from "@/modules/transport-service/forms/back-to-transport-services-button";
import { fetchTransportService } from "@/modules/transport-service/services";

export const Route = createFileRoute(
  "/transport-services/$transportServiceId/edit",
)({
  component: EditTransportServicePage,
});

function EditTransportServicePage() {
  const { transportServiceId } = Route.useParams();
  const id = Number(transportServiceId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/transport-services" });

  const {
    data: transportService,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transport-service", id],
    queryFn: () => fetchTransportService(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToTransportServicesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Edit Transport Service
        </h2>
        <p className="text-gray-400 mt-1">
          Update this transport service's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading transport service...</p>
        </div>
      ) : isError || !transportService ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Transport service not found.</p>
        </div>
      ) : (
        <EditTransportServiceForm
          transportService={transportService}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
