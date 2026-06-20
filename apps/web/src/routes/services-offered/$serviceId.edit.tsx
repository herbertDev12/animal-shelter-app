import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditServiceOfferedForm } from "@/modules/service-offered/forms/edit-service-offered";
import { BackToServicesButton } from "@/modules/service-offered/forms/back-to-services-button";
import { fetchServiceOffered } from "@/modules/service-offered/services";

export const Route = createFileRoute("/services-offered/$serviceId/edit")({
  component: EditServiceOfferedPage,
});

function EditServiceOfferedPage() {
  const { serviceId } = Route.useParams();
  const id = Number(serviceId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/services-offered" });

  const {
    data: service,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["service-offered", id],
    queryFn: () => fetchServiceOffered(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToServicesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Edit Service Offered
        </h2>
        <p className="text-gray-400 mt-1">
          Update this service offered's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading service offered...</p>
        </div>
      ) : isError || !service ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Service offered not found.</p>
        </div>
      ) : (
        <EditServiceOfferedForm
          service={service}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
