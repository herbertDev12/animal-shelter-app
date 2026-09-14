import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFSelect } from "@/components/fields/rhf-select";
import { RHFDateInput } from "@/components/fields/rhf-date-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchSupplierOptions } from "@/modules/supplier/services";
import {
  CONTRACT_CATEGORY_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
} from "@/lib/enum-ui";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

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
        queryFn={fetchSupplierOptions}
      />
      <RHFSelect
        name={"contract_category" as Path<T>}
        control={control}
        label="Category"
        placeholder="Select category"
        options={CONTRACT_CATEGORY_OPTIONS}
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
        options={CONTRACT_STATUS_OPTIONS}
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
