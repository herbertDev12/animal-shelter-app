import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditContractForm } from "@/modules/contract/forms/edit-contract";
import { BackToContractsButton } from "@/modules/contract/forms/back-to-contracts-button";
import { fetchContract } from "@/modules/contract/services";

export const Route = createFileRoute("/contracts/$contractId/edit")({
  component: EditContractPage,
});

function EditContractPage() {
  const { contractId } = Route.useParams();
  const id = Number(contractId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/contracts" });

  const {
    data: contract,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => fetchContract(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToContractsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Contract</h2>
        <p className="text-gray-400 mt-1">
          Update this contract's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading contract...</p>
        </div>
      ) : isError || !contract ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Contract not found.</p>
        </div>
      ) : (
        <EditContractForm
          contract={contract}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
