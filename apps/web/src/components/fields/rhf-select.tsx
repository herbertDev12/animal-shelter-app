import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

interface RHFSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  options: readonly { value: string; label: string }[];
}

export function RHFSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Select...",
  options,
}: RHFSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <Select
            value={field.value ?? undefined}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={name}
              className="bg-[#0b0e14] border-gray-800 text-white"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-[#10131a] border-gray-800 text-white">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="capitalize focus:bg-[#1f2937] focus:text-white"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
}
