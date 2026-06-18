import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateContractForm } from "@/modules/contract/forms/create-contract";
import { BackToContractsButton } from "@/modules/contract/forms/back-to-contracts-button";

export const Route = createFileRoute("/contracts/new")({
  component: NewContractPage,
});

function NewContractPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/contracts" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToContractsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Contract</h2>
        <p className="text-gray-400 mt-1">Add a new supplier contract.</p>
      </div>

      <CreateContractForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
