import { useEffect } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import {
  updateUserFormSchema,
  type UpdateUser,
  type UpdateUserForm,
  type User,
} from "@repo/schemas";
import { updateUser } from "../services";
import { UserFormFields } from "./user-form-fields";
import { shortId } from "@/lib/utils/short-id";

interface EditUserFormProps {
  user: User;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function EditUserForm({ user, onSaved, onCancel }: EditUserFormProps) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserFormSchema) as Resolver<UpdateUserForm>,
    defaultValues: {
      email: "",
      password: "",
      name: "",
      lastName: "",
      roleId: "",
    },
  });

  useEffect(() => {
    reset({
      email: user.email,
      password: "",
      name: user.name,
      lastName: user.lastName ?? "",
      roleId: user.roleId,
    });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateUser) => updateUser(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      toast.success("User updated successfully!");
      onSaved?.();
    },
    onError: (error) => {
      toast.error("Failed to update user", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = (data: UpdateUserForm) => {
    const payload: UpdateUser = { ...data };
    if (!payload.password) delete payload.password;
    if (payload.lastName === "") payload.lastName = null;
    mutation.mutate(payload);
  };

  const onInvalid = (errors: FieldErrors<UpdateUserForm>) => {
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
        Edit User <span className="text-[#cc97ff]">#{shortId(user.id)}</span>
      </h3>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <UserFormFields control={control} passwordOptional />
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
