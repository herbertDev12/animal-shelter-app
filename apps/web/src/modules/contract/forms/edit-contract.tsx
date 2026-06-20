import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createContractSchema,
  type Contract,
  type CreateContract,
} from "@repo/schemas";
import { updateContract } from "../services";
import { ContractFormFields } from "./contract-form-fields";

interface EditContractFormProps {
  contract: Contract;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditContractForm({
  contract,
  onSaved,
  onCancel,
}: EditContractFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateContract>({
    resolver: zodResolver(createContractSchema) as Resolver<CreateContract>,
    defaultValues: {
      contract_category: "Service",
      status: "Active",
      description: "",
    },
  });

  useEffect(() => {
    reset({
      id_supplier: contract.id_supplier,
      contract_category: contract.contract_category,
      start_date: contract.start_date
        ? new Date(contract.start_date)
        : undefined,
      end_date: contract.end_date ? new Date(contract.end_date) : undefined,
      reconciliation_date: contract.reconciliation_date
        ? new Date(contract.reconciliation_date)
        : undefined,
      description: contract.description ?? "",
      status: contract.status,
      base_price: contract.base_price,
      surcharge: contract.surcharge,
    });
  }, [contract, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateContract) => updateContract(contract.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contract updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update contract. Please try again.");
    },
  });

  const onSubmit = (data: CreateContract) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateContract>) => {
    const messages = Object.values(errors)
      .map((e) => e?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't save changes", {
      description:
        messages.length > 0
          ? messages.map((m) => `• ${m}`).join("  ")
          : "Please fill in all required fields before submitting.",
      duration: 4000,
    });
  };

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Edit Contract <span className="text-[#cc97ff]">#{contract.id}</span>
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <ContractFormFields control={control} />
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-[#10131a] border border-gray-800 text-gray-300 hover:bg-[#1f2937]"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
