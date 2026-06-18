import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateAdoptionForm } from "@/modules/adoption/forms/create-adoption";
import { BackToAdoptionsButton } from "@/modules/adoption/forms/back-to-adoptions-button";

export const Route = createFileRoute("/adoptions/new")({
  component: NewAdoptionPage,
});

function NewAdoptionPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/adoptions" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToAdoptionsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Adoption</h2>
        <p className="text-gray-400 mt-1">Record a new adoption.</p>
      </div>

      <CreateAdoptionForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
