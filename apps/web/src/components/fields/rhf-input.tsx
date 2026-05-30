"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";

interface RHFInputProps<
  T extends FieldValues,
> extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
}

export function RHFInput<T extends FieldValues>({
  name,
  control,
  label,
  ...props
}: RHFInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        {...field}
        {...props}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
