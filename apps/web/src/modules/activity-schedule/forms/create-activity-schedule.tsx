import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createActivityScheduleSchema,
  type CreateActivitySchedule,
} from "@repo/schemas";
import { createActivitySchedule } from "../services";
import { ActivityScheduleFormFields } from "./activity-schedule-form-fields";

interface CreateActivityScheduleFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateActivityScheduleForm({
  onCreated,
  onCancel,
}: CreateActivityScheduleFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateActivitySchedule>({
    resolver: zodResolver(
      createActivityScheduleSchema,
    ) as Resolver<CreateActivitySchedule>,
    defaultValues: {
      duration_days: 1,
      activity_type: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createActivitySchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-schedules"] });
      toast.success("Activity schedule created successfully!");
      reset();
      onCreated?.();
    },
    onError: () => {
      toast.error("Failed to create activity schedule. Please try again.");
    },
  });

  const onSubmit = (data: CreateActivitySchedule) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateActivitySchedule>) => {
    const messages = Object.values(errors)
      .map((e) => e?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't create activity schedule", {
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
        Create Activity Schedule
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <ActivityScheduleFormFields control={control} />
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
              "Create Activity Schedule"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
