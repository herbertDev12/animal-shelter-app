import { Control, FieldValues, Path } from "react-hook-form";
import { RHFNumberInput } from "@/components/fields/rhf-number-input";
import { RHFDateInput } from "@/components/fields/rhf-date-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchAnimals } from "@/modules/animal/services";

export function AdoptionFormFields<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <RHFFkSelect
        name={"id_animal" as Path<T>}
        control={control}
        label="Animal"
        placeholder="Select an animal"
        queryKey={["animals", "options"]}
        queryFn={() =>
          fetchAnimals({ limit: 100 }).then((rows) =>
            rows.map((a) => ({ id: a.id, label: a.name })),
          )
        }
      />
      <RHFDateInput
        name={"adoption_date" as Path<T>}
        control={control}
        label="Adoption date"
      />
      <RHFNumberInput
        name={"adoption_price" as Path<T>}
        control={control}
        label="Adoption price"
        placeholder="e.g. 50"
        step="0.01"
      />
    </div>
  );
}
