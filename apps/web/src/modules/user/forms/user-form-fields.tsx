import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchRoleOptions } from "@/modules/role/services";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

export function UserFormFields<T extends FieldValues>({
  control,
  passwordOptional = false,
}: {
  control: Control<T>;
  passwordOptional?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <RHFInput
        name={"email" as Path<T>}
        control={control}
        label="Email"
        type="email"
        placeholder="name@example.com"
        className={fieldClassName}
      />
      <RHFInput
        name={"name" as Path<T>}
        control={control}
        label="Name"
        placeholder="First name"
        className={fieldClassName}
      />
      <RHFInput
        name={"lastName" as Path<T>}
        control={control}
        label="Last name"
        placeholder="Last name"
        className={fieldClassName}
      />
      <RHFInput
        name={"password" as Path<T>}
        control={control}
        label={passwordOptional ? "Password (leave blank to keep)" : "Password"}
        type="password"
        placeholder="At least 8 characters"
        className={fieldClassName}
      />
      <RHFFkSelect
        name={"roleId" as Path<T>}
        control={control}
        label="Role"
        placeholder="Select role"
        queryKey={["role-options"]}
        queryFn={fetchRoleOptions}
      />
    </div>
  );
}
