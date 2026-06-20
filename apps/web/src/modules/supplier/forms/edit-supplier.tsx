import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createSupplierSchema,
  type Supplier,
  type CreateSupplier,
} from "@repo/schemas";
import { updateSupplier } from "../services";
import { SupplierFormFields } from "./supplier-form-fields";

interface EditSupplierFormProps {
  supplier: Supplier;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditSupplierForm({
  supplier,
  onSaved,
  onCancel,
}: EditSupplierFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateSupplier>({
    resolver: zodResolver(createSupplierSchema) as Resolver<CreateSupplier>,
    defaultValues: {
      name: "",
      type: "Veterinarian",
    },
  });

  useEffect(() => {
    reset({
      name: supplier.name ?? "",
      type: supplier.type,
      contact_name: supplier.contact_name ?? "",
      contact_email: supplier.contact_email ?? "",
      phone: supplier.phone ?? "",
      province: supplier.province ?? "",
      address: supplier.address ?? "",
    });
  }, [supplier, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateSupplier) => updateSupplier(supplier.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update supplier. Please try again.");
    },
  });

  const onSubmit = (data: CreateSupplier) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateSupplier>) => {
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
        Edit Supplier <span className="text-[#cc97ff]">#{supplier.id}</span>
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <SupplierFormFields control={control} />
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
