import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFNumberInput } from "@/components/fields/rhf-number-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchContracts } from "@/modules/contract/services";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

export function ServiceOfferedFormFields<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <RHFFkSelect
        name={"id_contract" as Path<T>}
        control={control}
        label="Contract"
        placeholder="Select a contract"
        queryKey={["contracts", "options"]}
        queryFn={() =>
          fetchContracts({ limit: 100 }).then((rows) =>
            rows.map((c) => ({ id: c.id, label: `Contract #${c.id}` })),
          )
        }
      />
      <RHFInput
        name={"name" as Path<T>}
        control={control}
        label="Name"
        placeholder="Service name"
        className={fieldClassName}
      />
      <RHFInput
        name={"food_type" as Path<T>}
        control={control}
        label="Food type"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFNumberInput
        name={"base_price" as Path<T>}
        control={control}
        label="Base price"
        placeholder="0.00"
        step="0.01"
      />
      <RHFNumberInput
        name={"surcharge" as Path<T>}
        control={control}
        label="Surcharge"
        placeholder="0.00"
        step="0.01"
      />
    </div>
  );
}
