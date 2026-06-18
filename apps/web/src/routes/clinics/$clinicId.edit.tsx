import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditClinicForm } from "@/modules/clinic/forms/edit-clinic";
import { BackToClinicsButton } from "@/modules/clinic/forms/back-to-clinics-button";
import { fetchClinic } from "@/modules/clinic/services";

export const Route = createFileRoute("/clinics/$clinicId/edit")({
  component: EditClinicPage,
});

function EditClinicPage() {
  const { clinicId } = Route.useParams();
  const id = Number(clinicId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/clinics" });

  const {
    data: clinic,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clinic", id],
    queryFn: () => fetchClinic(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToClinicsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Clinic</h2>
        <p className="text-gray-400 mt-1">Update this clinic's information.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading clinic...</p>
        </div>
      ) : isError || !clinic ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Clinic not found.</p>
        </div>
      ) : (
        <EditClinicForm
          clinic={clinic}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
