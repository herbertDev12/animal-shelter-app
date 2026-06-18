import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

export function ClinicFormFields<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <RHFInput
        name={"name" as Path<T>}
        control={control}
        label="Name"
        placeholder="e.g. Central Vet Clinic"
        className={fieldClassName}
      />
      <RHFInput
        name={"province" as Path<T>}
        control={control}
        label="Province"
        placeholder="e.g. Havana"
        className={fieldClassName}
      />
      <RHFInput
        name={"address" as Path<T>}
        control={control}
        label="Address"
        placeholder="e.g. 123 Main St"
        className={fieldClassName}
      />
    </div>
  );
}
