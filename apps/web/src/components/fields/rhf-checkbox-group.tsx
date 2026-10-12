"use client";

import { useController, Control, FieldValues, Path } from "react-hook-form";
import { Label } from "@repo/ui";
import { cn } from "@/lib/cn";

export interface CheckboxOption {
  value: string;
  label: string;
}

export interface CheckboxGroup {
  label?: string;
  options: readonly CheckboxOption[];
}

interface RHFCheckboxGroupProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  groups: readonly CheckboxGroup[];
}

export function RHFCheckboxGroup<T extends FieldValues>({
  name,
  control,
  label,
  groups,
}: RHFCheckboxGroupProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const selected: string[] = Array.isArray(field.value) ? field.value : [];

  const toggle = (value: string) => {
    field.onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {label && <Label>{label}</Label>}
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="flex flex-col gap-2">
          {group.label && (
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              {group.label}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    checked
                      ? "border-purple-500/60 bg-purple-500/10 text-white"
                      : "border-gray-800 bg-[#0b0e14] text-gray-300 hover:bg-[#161a21]",
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#cc97ff]"
                    checked={checked}
                    onChange={() => toggle(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
