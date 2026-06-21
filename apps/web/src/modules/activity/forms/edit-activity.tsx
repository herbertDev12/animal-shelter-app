import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  createActivitySchema,
  type Activity,
  type CreateActivity,
} from "@repo/schemas";
import { updateActivity } from "../services";
import { ActivityFormFields } from "./activity-form-fields";

interface EditActivityFormProps {
  activity: Activity;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditActivityForm({
  activity,
  onSaved,
  onCancel,
}: EditActivityFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateActivity>({
    resolver: zodResolver(createActivitySchema) as Resolver<CreateActivity>,
    defaultValues: {
      description: "",
    },
  });

  useEffect(() => {
    reset({
      id_animal: activity.id_animal,
      id_service: activity.id_service,
      date: activity.date ?? "",
      time: activity.time ?? "",
      description: activity.description ?? "",
    });
  }, [activity, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateActivity) =>
      updateActivity(activity.id_activity, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Activity updated successfully!");
      onSaved?.();
    },
    onError: () => {
      toast.error("Failed to update activity. Please try again.");
    },
  });

  const onSubmit = (data: CreateActivity) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<CreateActivity>) => {
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
        Edit Activity{" "}
        <span className="text-[#cc97ff]">#{activity.id_activity}</span>
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <ActivityFormFields control={control} />
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
