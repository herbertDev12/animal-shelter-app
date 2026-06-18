import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Label } from "@repo/ui";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

interface RHFDateInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
}

export function RHFDateInput<T extends FieldValues>({
  name,
  control,
  label,
}: RHFDateInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <input
            id={name}
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
  );
}
