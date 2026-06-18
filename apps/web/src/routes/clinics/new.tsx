import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateClinicForm } from "@/modules/clinic/forms/create-clinic";
import { BackToClinicsButton } from "@/modules/clinic/forms/back-to-clinics-button";

export const Route = createFileRoute("/clinics/new")({
  component: NewClinicPage,
});

function NewClinicPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/clinics" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToClinicsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Clinic</h2>
        <p className="text-gray-400 mt-1">Add a new veterinary clinic.</p>
      </div>

      <CreateClinicForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
