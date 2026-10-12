import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { registerInputSchema, type RegisterInput } from "@repo/schemas";
import { createUser } from "../services";
import { UserFormFields } from "./user-form-fields";

interface CreateUserFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateUserForm({ onCreated, onCancel }: CreateUserFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema) as Resolver<RegisterInput>,
    defaultValues: {
      email: "",
      password: "",
      name: "",
      lastName: "",
      roleId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully!");
      reset();
      onCreated?.();
    },
    onError: (error) => {
      toast.error("Failed to create user", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = (data: RegisterInput) => {
    const payload = { ...data };
    if (payload.lastName === "") delete payload.lastName;
    mutation.mutate(payload);
  };

  const onInvalid = (errors: FieldErrors<RegisterInput>) => {
    const messages = Object.values(errors)
      .map((error) => error?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't create user", {
      description:
        messages.length > 0
          ? messages.map((message) => `• ${message}`).join("  ")
          : "Please fill in all required fields before submitting.",
      duration: 4000,
    });
  };

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Create User</h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <UserFormFields control={control} />
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
              "Create User"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
