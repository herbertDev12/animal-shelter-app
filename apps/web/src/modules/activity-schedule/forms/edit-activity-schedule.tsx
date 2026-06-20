import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createActivityScheduleSchema,
  type ActivitySchedule,
  type CreateActivitySchedule,
} from "@repo/schemas";
import { updateActivitySchedule } from "../services";
import { ActivityScheduleFormFields } from "./activity-schedule-form-fields";

interface EditActivityScheduleFormProps {
  schedule: ActivitySchedule;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditActivityScheduleForm({
  schedule,
  onSaved,
  onCancel,
}: EditActivityScheduleFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateActivitySchedule>({
    resolver: zodResolver(
      createActivityScheduleSchema,
    ) as Resolver<CreateActivitySchedule>,
    defaultValues: {
      duration_days: 1,
      additional_surcharge: 0,
      activity_type: "",
      description: "",
    },
  });

  useEffect(() => {
    reset({
      id_animal: schedule.id_animal,
      id_contract: schedule.id_contract,
      activity_type: schedule.activity_type ?? "",
      date: schedule.date ?? "",
      time: schedule.time ?? "",
      duration_days: schedule.duration_days,
      additional_surcharge: schedule.additional_surcharge,
      description: schedule.description ?? "",
    });
  }, [schedule, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateActivitySchedule) =>
      updateActivitySchedule(schedule.id_schedule, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-schedules"] });
      toast.success("Activity schedule updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update activity schedule. Please try again.");
    },
  });

  const onSubmit = (data: CreateActivitySchedule) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateActivitySchedule>) => {
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
        Edit Activity Schedule{" "}
        <span className="text-[#cc97ff]">#{schedule.id_schedule}</span>
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
