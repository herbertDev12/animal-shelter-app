import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Label } from "@repo/ui";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

interface RHFNumberInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  min?: number;
  step?: string;
}

export function RHFNumberInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  min = 0,
  step,
}: RHFNumberInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <input
            id={name}
            type="number"
            min={min}
            step={step}
            value={field.value ?? ""}
            onChange={(e) =>
              field.onChange(
                e.target.value === "" ? undefined : e.target.valueAsNumber,
              )
            }
            onBlur={field.onBlur}
            placeholder={placeholder}
            className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${fieldClassName} ${
              error ? "border-red-500" : ""
            }`}
          />
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
}
