import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createAdoptionSchema,
  type Adoption,
  type CreateAdoption,
} from "@repo/schemas";
import { updateAdoption } from "../services";
import { AdoptionFormFields } from "./adoption-form-fields";

interface EditAdoptionFormProps {
  adoption: Adoption;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditAdoptionForm({
  adoption,
  onSaved,
  onCancel,
}: EditAdoptionFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateAdoption>({
    resolver: zodResolver(createAdoptionSchema) as Resolver<CreateAdoption>,
  });

  useEffect(() => {
    reset({
      id_animal: adoption.id_animal,
      adoption_date: adoption.adoption_date
        ? new Date(adoption.adoption_date)
        : undefined,
      adoption_price: adoption.adoption_price ?? undefined,
    });
  }, [adoption, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateAdoption) => updateAdoption(adoption.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions"] });
      toast.success("Adoption updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update adoption. Please try again.");
    },
  });

  const onSubmit = (data: CreateAdoption) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateAdoption>) => {
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
        Edit Adoption <span className="text-[#cc97ff]">#{adoption.id}</span>
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <AdoptionFormFields control={control} />
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
