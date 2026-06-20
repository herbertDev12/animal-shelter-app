import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createVeterinarianSchema,
  type CreateVeterinarian,
  type Veterinarian,
} from "@repo/schemas";
import { updateVeterinarian } from "../services";
import { VeterinarianFormFields } from "./veterinarian-form-fields";

interface EditVeterinarianFormProps {
  veterinarian: Veterinarian;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditVeterinarianForm({
  veterinarian,
  onSaved,
  onCancel,
}: EditVeterinarianFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateVeterinarian>({
    resolver: zodResolver(
      createVeterinarianSchema,
    ) as Resolver<CreateVeterinarian>,
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    reset({
      name: veterinarian.name ?? "",
      id_clinic: veterinarian.id_clinic ?? undefined,
      specialty: veterinarian.specialty ?? "",
      modality: veterinarian.modality ?? "",
      contact_name: veterinarian.contact_name ?? "",
      contact_email: veterinarian.contact_email ?? "",
      veterinarian_email: veterinarian.veterinarian_email ?? "",
      phone: veterinarian.phone ?? "",
      fax: veterinarian.fax ?? "",
      province: veterinarian.province ?? "",
      address: veterinarian.address ?? "",
      city_distance: veterinarian.city_distance ?? undefined,
    });
  }, [veterinarian, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateVeterinarian) =>
      updateVeterinarian(veterinarian.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veterinarians"] });
      toast.success("Veterinarian updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update veterinarian. Please try again.");
    },
  });

  const onSubmit = (data: CreateVeterinarian) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateVeterinarian>) => {
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
        Edit Veterinarian{" "}
        <span className="text-[#cc97ff]">#{veterinarian.id}</span>
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <VeterinarianFormFields control={control} />
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
