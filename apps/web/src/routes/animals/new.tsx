import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateAnimalForm } from "@/modules/animal/forms/create-animal";
import { BackToAnimalsButton } from "@/modules/animal/forms/back-to-animals-button";

export const Route = createFileRoute("/animals/new")({
  component: NewAnimalPage,
});

function NewAnimalPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/animals" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToAnimalsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Animal</h2>
        <p className="text-gray-400 mt-1">Add a new animal to the shelter.</p>
      </div>

      <CreateAnimalForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
