import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { createAnimalSchema, type CreateAnimal } from "@repo/schemas";
import { createAnimal } from "../services";
import { AnimalFormFields } from "./animal-form-fields";

interface CreateAnimalFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateAnimalForm({
  onCreated,
  onCancel,
}: CreateAnimalFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateAnimal>({
    resolver: zodResolver(createAnimalSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      status: "available",
    },
  });

  const mutation = useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Animal created successfully!");
      reset();
      onCreated?.();
    },
    onError: () => {
      toast.error("Failed to create animal. Please try again.");
    },
  });

  const onSubmit = (data: CreateAnimal) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Create Animal</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimalFormFields control={control} />
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
              "Create Animal"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
