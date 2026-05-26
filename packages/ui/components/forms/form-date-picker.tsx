import * as React from "react"
import { FieldPath, FieldValues, UseControllerProps } from "react-hook-form"

import { DatePicker } from "@/components/ui/date-picker"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/forms/form"

interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
  label?: string
  description?: string
  placeholder?: string
}

const FormDatePicker = React.forwardRef<
  HTMLButtonElement,
  FormDatePickerProps
>(
  (
    { control, name, label, description, placeholder, ...props },
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
              <DatePicker
                ref={ref}
                value={field.value}
                onChange={field.onChange}
                disabled={props.disabled}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }
)

FormDatePicker.displayName = "FormDatePicker"

export { FormDatePicker, type FormDatePickerProps }
