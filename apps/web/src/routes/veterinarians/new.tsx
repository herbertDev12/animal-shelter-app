import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateVeterinarianForm } from "@/modules/veterinarian/forms/create-veterinarian";
import { BackToVeterinariansButton } from "@/modules/veterinarian/forms/back-to-veterinarians-button";

export const Route = createFileRoute("/veterinarians/new")({
  component: NewVeterinarianPage,
});

function NewVeterinarianPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/veterinarians" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToVeterinariansButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Create Veterinarian
        </h2>
        <p className="text-gray-400 mt-1">Add a new veterinarian.</p>
      </div>

      <CreateVeterinarianForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
