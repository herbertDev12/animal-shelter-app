import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditAdoptionForm } from "@/modules/adoption/forms/edit-adoption";
import { BackToAdoptionsButton } from "@/modules/adoption/forms/back-to-adoptions-button";
import { fetchAdoption } from "@/modules/adoption/services";

export const Route = createFileRoute("/adoptions/$adoptionId/edit")({
  component: EditAdoptionPage,
});

function EditAdoptionPage() {
  const { adoptionId } = Route.useParams();
  const id = Number(adoptionId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/adoptions" });

  const {
    data: adoption,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adoption", id],
    queryFn: () => fetchAdoption(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToAdoptionsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Adoption</h2>
        <p className="text-gray-400 mt-1">
          Update this adoption's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading adoption...</p>
        </div>
      ) : isError || !adoption ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Adoption not found.</p>
        </div>
      ) : (
        <EditAdoptionForm
          adoption={adoption}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
