import * as React from "react"
import { FieldPath, FieldValues, UseControllerProps } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/forms/form"

interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
  label?: string
  description?: string
  placeholder?: string
  options: FormSelectOption[]
}

const FormSelect = React.forwardRef<
  HTMLButtonElement,
  FormSelectProps
>(
  (
    { control, name, label, description, placeholder, options, ...props },
    ref
  ) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger ref={ref} {...props}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }
)

FormSelect.displayName = "FormSelect"

export { FormSelect, type FormSelectProps, type FormSelectOption }
