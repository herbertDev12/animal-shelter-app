import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { createDonationSchema, type CreateDonation } from "@repo/schemas";
import { createDonation } from "../services";
import { DonationFormFields } from "./donation-form-fields";

interface CreateDonationFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateDonationForm({
  onCreated,
  onCancel,
}: CreateDonationFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateDonation>({
    resolver: zodResolver(createDonationSchema) as Resolver<CreateDonation>,
    defaultValues: { donor: "" },
  });

  const mutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donation created successfully!");
      reset();
      onCreated?.();
    },
    onError: () => {
      toast.error("Failed to create donation. Please try again.");
    },
  });

  const onSubmit = (data: CreateDonation) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateDonation>) => {
    const messages = Object.values(errors)
      .map((e) => e?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't create donation", {
      description:
        messages.length > 0
          ? messages.map((m) => `• ${m}`).join("  ")
          : "Please fill in all required fields before submitting.",
      duration: 4000,
    });
  };

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Create Donation</h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <DonationFormFields control={control} />
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
              "Create Donation"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
