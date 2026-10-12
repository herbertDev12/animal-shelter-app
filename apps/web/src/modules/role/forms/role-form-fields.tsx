"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Label, Switch } from "@repo/ui";
import type { Permission } from "@repo/schemas";
import { RHFInput } from "@/components/fields/rhf-input";
import {
  RHFCheckboxGroup,
  type CheckboxGroup,
} from "@/components/fields/rhf-checkbox-group";
import { fetchPermissions } from "../services";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

/** Groups the permission catalog by its `<module>.<action>` prefix. */
function groupPermissions(permissions: Permission[]): CheckboxGroup[] {
  const groups = new Map<string, { value: string; label: string }[]>();

  for (const permission of permissions) {
    const [module = permission.code] = permission.code.split(".");
    const options = groups.get(module) ?? [];
    options.push({ value: permission.id, label: permission.name });
    groups.set(module, options);
  }

  return [...groups.entries()].map(([module, options]) => ({
    label: module,
    options,
  }));
}

export function RoleFormFields<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RHFInput
          name={"name" as Path<T>}
          control={control}
          label="Name"
          placeholder="Role name"
          className={fieldClassName}
        />
        <Controller
          name={"isActive" as Path<T>}
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="isActive">Active</Label>
              <div className="flex h-10 items-center gap-3">
                <Switch
                  id="isActive"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
                <span className="text-sm text-gray-300">
                  {field.value ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading permissions...
        </div>
      ) : (
        <RHFCheckboxGroup
          name={"permissionIds" as Path<T>}
          control={control}
          label="Permissions"
          groups={groupPermissions(permissions)}
        />
      )}
    </div>
  );
}
