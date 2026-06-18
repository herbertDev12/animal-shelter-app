import { useQuery } from "@tanstack/react-query";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

export interface FkOption {
  id: number;
  label: string;
}

interface RHFFkSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  queryKey: unknown[];
  queryFn: () => Promise<FkOption[]>;
}

export function RHFFkSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Select...",
  queryKey,
  queryFn,
}: RHFFkSelectProps<T>) {
  const { data: options = [] } = useQuery({ queryKey, queryFn });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <Select
            value={field.value != null ? String(field.value) : undefined}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <SelectTrigger
              id={name}
              className="bg-[#0b0e14] border-gray-800 text-white"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-[#10131a] border-gray-800 text-white">
              {options.map((option) => (
                <SelectItem
                  key={option.id}
                  value={String(option.id)}
                  className="focus:bg-[#1f2937] focus:text-white"
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
