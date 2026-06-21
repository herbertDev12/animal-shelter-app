import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Label } from "@repo/ui";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchAnimals } from "@/modules/animal/services";
import { fetchServicesOffered } from "@/modules/service-offered/services";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

export function ActivityFormFields<T extends FieldValues>({
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
      <RHFFkSelect
        name={"id_service" as Path<T>}
        control={control}
        label="Service"
        placeholder="Select a service"
        queryKey={["services-offered", "options"]}
        queryFn={() =>
          fetchServicesOffered({ limit: 100 }).then((rows) =>
            rows.map((s) => ({
              id: s.id,
              label: `${s.name} (Contract #${s.id_contract})`,
            })),
          )
        }
      />
      <Controller
        name={"date" as Path<T>}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <input
              id="date"
              type="date"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || undefined)}
              onBlur={field.onBlur}
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${fieldClassName} ${
                error ? "border-red-500" : ""
              }`}
            />
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </div>
        )}
      />
      <RHFInput
        name={"time" as Path<T>}
        control={control}
        label="Time"
        placeholder="e.g. 14:30"
        className={fieldClassName}
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
