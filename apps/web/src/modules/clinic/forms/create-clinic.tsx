import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { createClinicSchema, type CreateClinic } from "@repo/schemas";
import { createClinic } from "../services";
import { ClinicFormFields } from "./clinic-form-fields";

interface CreateClinicFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateClinicForm({
  onCreated,
  onCancel,
}: CreateClinicFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateClinic>({
    resolver: zodResolver(createClinicSchema) as Resolver<CreateClinic>,
    defaultValues: {
      name: "",
      province: "",
      address: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success("Clinic created successfully!");
      reset();
      onCreated?.();
    },
    onError: () => {
      toast.error("Failed to create clinic. Please try again.");
    },
  });

  const onSubmit = (data: CreateClinic) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateClinic>) => {
    const messages = Object.values(errors)
      .map((e) => e?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't create clinic", {
      description:
        messages.length > 0
          ? messages.map((m) => `• ${m}`).join("  ")
          : "Please fill in all required fields before submitting.",
      duration: 4000,
    });
  };

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Create Clinic</h3>
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
                Creating...
              </>
            ) : (
              "Create Clinic"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
