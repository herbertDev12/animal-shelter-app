import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { updateRoleSchema, type Role, type UpdateRole } from "@repo/schemas";
import { updateRole } from "../services";
import { RoleFormFields } from "./role-form-fields";
import { shortId } from "@/lib/utils/short-id";

interface EditRoleFormProps {
  role: Role;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditRoleForm({ role, onSaved, onCancel }: EditRoleFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<UpdateRole>({
    resolver: zodResolver(updateRoleSchema) as Resolver<UpdateRole>,
    defaultValues: { name: "", isActive: true, permissionIds: [] },
  });

  useEffect(() => {
    reset({
      name: role.name,
      isActive: role.isActive,
      permissionIds: role.permissions.map((permission) => permission.id),
    });
  }, [role, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateRole) => updateRole(role.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", role.id] });
      toast.success("Role updated successfully!");
      onSaved?.();
    },
    onError: (error) => {
      toast.error("Failed to update role", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = (data: UpdateRole) => mutation.mutate(data);

  const onInvalid = (errors: FieldErrors<UpdateRole>) => {
    const messages = Object.values(errors)
      .map((error) => error?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't save changes", {
      description:
        messages.length > 0
          ? messages.map((message) => `• ${message}`).join("  ")
          : "Please fill in all required fields before submitting.",
      duration: 4000,
    });
  };

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Edit Role <span className="text-[#cc97ff]">#{shortId(role.id)}</span>
      </h3>
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
