import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createDonationSchema,
  type Donation,
  type CreateDonation,
} from "@repo/schemas";
import { updateDonation } from "../services";
import { DonationFormFields } from "./donation-form-fields";

interface EditDonationFormProps {
  donation: Donation;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditDonationForm({
  donation,
  onSaved,
  onCancel,
}: EditDonationFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateDonation>({
    resolver: zodResolver(createDonationSchema) as Resolver<CreateDonation>,
  });

  useEffect(() => {
    reset({
      id_animal: donation.id_animal,
      amount: donation.amount,
      date: donation.date ? new Date(donation.date) : undefined,
      donor: donation.donor ?? "",
    });
  }, [donation, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateDonation) => updateDonation(donation.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donation updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update donation. Please try again.");
    },
  });

  const onSubmit = (data: CreateDonation) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateDonation>) => {
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
        Edit Donation <span className="text-[#cc97ff]">#{donation.id}</span>
      </h3>
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
