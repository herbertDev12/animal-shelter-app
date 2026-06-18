import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createClinicSchema,
  type Clinic,
  type CreateClinic,
} from "@repo/schemas";
import { updateClinic } from "../services";
import { ClinicFormFields } from "./clinic-form-fields";

interface EditClinicFormProps {
  clinic: Clinic;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditClinicForm({
  clinic,
  onSaved,
  onCancel,
}: EditClinicFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateClinic>({
    resolver: zodResolver(createClinicSchema) as Resolver<CreateClinic>,
    defaultValues: {
      name: "",
      province: "",
      address: "",
    },
  });

  useEffect(() => {
    reset({
      name: clinic.name,
      province: clinic.province ?? "",
      address: clinic.address ?? "",
    });
  }, [clinic, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateClinic) => updateClinic(clinic.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success("Clinic updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update clinic. Please try again.");
    },
  });

  const onSubmit = (data: CreateClinic) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateClinic>) => {
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
        Edit Clinic <span className="text-[#cc97ff]">#{clinic.id}</span>
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <ClinicFormFields control={control} />
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
