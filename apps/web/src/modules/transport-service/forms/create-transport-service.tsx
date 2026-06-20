import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createTransportServiceSchema,
  type CreateTransportService,
} from "@repo/schemas";
import { createTransportService } from "../services";
import { TransportServiceFormFields } from "./transport-service-form-fields";

interface CreateTransportServiceFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateTransportServiceForm({
  onCreated,
  onCancel,
}: CreateTransportServiceFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateTransportService>({
    resolver: zodResolver(
      createTransportServiceSchema,
    ) as Resolver<CreateTransportService>,
    defaultValues: {
      status: "Active",
      vehicle: "",
      transport_modality: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createTransportService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-services"] });
      toast.success("Transport service created successfully!");
      reset();
      onCreated?.();
    },
    onError: () => {
      toast.error("Failed to create transport service. Please try again.");
    },
  });

  const onSubmit = (data: CreateTransportService) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateTransportService>) => {
    const messages = Object.values(errors)
      .map((e) => e?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't create transport service", {
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
        Create Transport Service
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <TransportServiceFormFields control={control} />
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
              "Create Transport Service"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
