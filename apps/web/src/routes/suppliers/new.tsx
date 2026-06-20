import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateSupplierForm } from "@/modules/supplier/forms/create-supplier";
import { BackToSuppliersButton } from "@/modules/supplier/forms/back-to-suppliers-button";

export const Route = createFileRoute("/suppliers/new")({
  component: NewSupplierPage,
});

function NewSupplierPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/suppliers" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToSuppliersButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Supplier</h2>
        <p className="text-gray-400 mt-1">Add a new supplier.</p>
      </div>

      <CreateSupplierForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
