import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFSelect } from "@/components/fields/rhf-select";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

const TYPE_OPTIONS = [
  { value: "Veterinarian", label: "Veterinarian" },
  { value: "Food Company", label: "Food Company" },
  { value: "Service Company", label: "Service Company" },
] as const;

export function SupplierFormFields<T extends FieldValues>({
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
        placeholder="Supplier name"
        className={fieldClassName}
      />
      <RHFSelect
        name={"type" as Path<T>}
        control={control}
        label="Type"
        placeholder="Select type"
        options={TYPE_OPTIONS}
      />
      <RHFInput
        name={"contact_name" as Path<T>}
        control={control}
        label="Contact name"
        placeholder="Contact person"
        className={fieldClassName}
      />
      <RHFInput
        name={"contact_email" as Path<T>}
        control={control}
        label="Contact email"
        placeholder="name@example.com"
        className={fieldClassName}
      />
      <RHFInput
        name={"phone" as Path<T>}
        control={control}
        label="Phone"
        placeholder="Phone number"
        className={fieldClassName}
      />
      <RHFInput
        name={"province" as Path<T>}
        control={control}
        label="Province"
        placeholder="Province"
        className={fieldClassName}
      />
      <RHFInput
        name={"address" as Path<T>}
        control={control}
        label="Address"
        placeholder="Address"
        className={fieldClassName}
      />
    </div>
  );
}
