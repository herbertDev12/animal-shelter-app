import * as React from "react";
import { FieldPath, FieldValues, UseControllerProps } from "react-hook-form";

import { Input, type InputProps } from "../ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../forms/form";

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
  extends UseControllerProps<TFieldValues, TName>, Omit<InputProps, "name"> {
  label?: string;
  description?: string;
  placeholder?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    { control, name, label, description, placeholder, type = "text", ...props },
    ref,
  ) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Input
                ref={ref}
                type={type}
                placeholder={placeholder}
                {...field}
                {...props}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
);

FormInput.displayName = "FormInput";

export { FormInput, type FormInputProps };
