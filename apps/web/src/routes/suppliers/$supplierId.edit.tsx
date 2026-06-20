import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditSupplierForm } from "@/modules/supplier/forms/edit-supplier";
import { BackToSuppliersButton } from "@/modules/supplier/forms/back-to-suppliers-button";
import { fetchSupplier } from "@/modules/supplier/services";

export const Route = createFileRoute("/suppliers/$supplierId/edit")({
  component: EditSupplierPage,
});

function EditSupplierPage() {
  const { supplierId } = Route.useParams();
  const id = Number(supplierId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/suppliers" });

  const {
    data: supplier,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["supplier", id],
    queryFn: () => fetchSupplier(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToSuppliersButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Supplier</h2>
        <p className="text-gray-400 mt-1">
          Update this supplier's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading supplier...</p>
        </div>
      ) : isError || !supplier ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Supplier not found.</p>
        </div>
      ) : (
        <EditSupplierForm
          supplier={supplier}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
