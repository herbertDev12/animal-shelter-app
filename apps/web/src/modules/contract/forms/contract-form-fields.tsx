import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFSelect } from "@/components/fields/rhf-select";
import { RHFDateInput } from "@/components/fields/rhf-date-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchSuppliers } from "@/modules/contract/services";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

const CATEGORY_OPTIONS = [
  { value: "Veterinarian", label: "Veterinarian" },
  { value: "Food", label: "Food" },
  { value: "Service", label: "Service" },
] as const;

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Expired", label: "Expired" },
] as const;

export function ContractFormFields<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <RHFFkSelect
        name={"id_supplier" as Path<T>}
        control={control}
        label="Supplier"
        placeholder="Select a supplier"
        queryKey={["suppliers", "options"]}
        queryFn={() =>
          fetchSuppliers().then((rows) =>
            rows.map((s) => ({ id: s.id, label: s.name })),
          )
        }
      />
      <RHFSelect
        name={"contract_category" as Path<T>}
        control={control}
        label="Category"
        placeholder="Select category"
        options={CATEGORY_OPTIONS}
      />
      <RHFDateInput
        name={"start_date" as Path<T>}
        control={control}
        label="Start date"
      />
      <RHFDateInput
        name={"end_date" as Path<T>}
        control={control}
        label="End date"
      />
      <RHFDateInput
        name={"reconciliation_date" as Path<T>}
        control={control}
        label="Reconciliation date"
      />
      <RHFSelect
        name={"status" as Path<T>}
        control={control}
        label="Status"
        placeholder="Select status"
        options={STATUS_OPTIONS}
      />
      <RHFInput
        name={"description" as Path<T>}
        control={control}
        label="Description"
        placeholder="Optional notes"
        className={fieldClassName}
      />
    </div>
  );
}
