import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { createRoleSchema, type CreateRole } from "@repo/schemas";
import { createRole } from "../services";
import { RoleFormFields } from "./role-form-fields";

interface CreateRoleFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateRoleForm({ onCreated, onCancel }: CreateRoleFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateRole>({
    resolver: zodResolver(createRoleSchema) as Resolver<CreateRole>,
    defaultValues: {
      name: "",
      isActive: true,
      permissionIds: [],
    },
  });

  const mutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully!");
      reset();
      onCreated?.();
    },
    onError: (error) => {
      toast.error("Couldn't create role", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = (data: CreateRole) => mutation.mutate(data);

  const onInvalid = (errors: FieldErrors<CreateRole>) => {
    const messages = Object.values(errors)
      .map((error) => error?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't create role", {
      description:
        messages.length > 0
          ? messages.map((message) => `• ${message}`).join("  ")
          : "Please fill in all required fields before submitting.",
      duration: 4000,
    });
  };

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Create Role</h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <RoleFormFields control={control} />
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
              "Create Role"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
