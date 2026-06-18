import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditAnimalForm } from "@/modules/animal/forms/edit-animal";
import { BackToAnimalsButton } from "@/modules/animal/forms/back-to-animals-button";
import { fetchAnimal } from "@/modules/animal/services";

export const Route = createFileRoute("/animals/$animalId/edit")({
  component: EditAnimalPage,
});

function EditAnimalPage() {
  const { animalId } = Route.useParams();
  const id = Number(animalId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/animals" });

  const {
    data: animal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["animal", id],
    queryFn: () => fetchAnimal(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToAnimalsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Animal</h2>
        <p className="text-gray-400 mt-1">Update this animal's information.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading animal...</p>
        </div>
      ) : isError || !animal ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Animal not found.</p>
        </div>
      ) : (
        <EditAnimalForm
          animal={animal}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
