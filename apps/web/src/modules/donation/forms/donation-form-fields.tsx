import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFNumberInput } from "@/components/fields/rhf-number-input";
import { RHFDateInput } from "@/components/fields/rhf-date-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchAnimals } from "@/modules/animal/services";

export function DonationFormFields<T extends FieldValues>({
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
      <RHFNumberInput
        name={"amount" as Path<T>}
        control={control}
        label="Amount"
        placeholder="e.g. 50"
        step="0.01"
      />
      <RHFDateInput name={"date" as Path<T>} control={control} label="Date" />
      <RHFInput
        name={"donor" as Path<T>}
        control={control}
        label="Donor"
        placeholder="e.g. John Doe"
      />
    </div>
  );
}
