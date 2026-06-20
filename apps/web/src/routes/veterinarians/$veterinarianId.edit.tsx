import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditVeterinarianForm } from "@/modules/veterinarian/forms/edit-veterinarian";
import { BackToVeterinariansButton } from "@/modules/veterinarian/forms/back-to-veterinarians-button";
import { fetchVeterinarian } from "@/modules/veterinarian/services";

export const Route = createFileRoute("/veterinarians/$veterinarianId/edit")({
  component: EditVeterinarianPage,
});

function EditVeterinarianPage() {
  const { veterinarianId } = Route.useParams();
  const id = Number(veterinarianId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/veterinarians" });

  const {
    data: veterinarian,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["veterinarian", id],
    queryFn: () => fetchVeterinarian(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToVeterinariansButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Veterinarian</h2>
        <p className="text-gray-400 mt-1">
          Update this veterinarian's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading veterinarian...</p>
        </div>
      ) : isError || !veterinarian ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Veterinarian not found.</p>
        </div>
      ) : (
        <EditVeterinarianForm
          veterinarian={veterinarian}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
