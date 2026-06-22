import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { RHFInput } from "@/components/fields/rhf-input";

const STATUS_OPTIONS = ["available", "adopted", "reserved"] as const;

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

export function AnimalFormFields<T extends FieldValues>({
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
        placeholder="e.g. Rex"
        className={fieldClassName}
      />
      <RHFInput
        name={"species" as Path<T>}
        control={control}
        label="Species"
        placeholder="e.g. Dog"
        className={fieldClassName}
      />
      <RHFInput
        name={"breed" as Path<T>}
        control={control}
        label="Breed"
        placeholder="e.g. Labrador"
        className={fieldClassName}
      />

      <Controller
        name={"weight" as Path<T>}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <input
              id="weight"
              type="number"
              min={0}
              step="0.1"
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? undefined : e.target.valueAsNumber,
                )
              }
              onBlur={field.onBlur}
              placeholder="e.g. 12.5"
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${fieldClassName} ${
                error ? "border-red-500" : ""
              }`}
            />
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </div>
        )}
      />

      <Controller
        name={"birth_date" as Path<T>}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor="birth_date">Birth date</Label>
            <input
              id="birth_date"
              type="date"
              value={
                field.value
                  ? new Date(field.value).toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                field.onChange(
                  e.target.value ? new Date(e.target.value) : undefined,
                )
              }
              onBlur={field.onBlur}
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${fieldClassName} ${
                error ? "border-red-500" : ""
              }`}
            />
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </div>
        )}
      />

      <Controller
        name={"status" as Path<T>}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="status"
                className="bg-[#0b0e14] border-gray-800 text-white"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-[#10131a] border-gray-800 text-white">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="capitalize focus:bg-[#1f2937] focus:text-white"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </div>
        )}
      />
    </div>
  );
}
