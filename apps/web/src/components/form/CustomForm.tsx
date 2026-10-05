import type { ReactNode } from "react";
import { useFormik } from "formik";
import type { AnyObjectSchema } from "yup";
import { FormField, type FormFieldType } from "~/components/form/FormField";

export interface FormFieldConfig<T> {
  name: Extract<keyof T, string>;
  label: string;
  type?: FormFieldType;
  placeholder?: string;
  autoComplete?: string;
}

interface CustomFormProps<T> {
  initialValues: T;
  fields: FormFieldConfig<T>[];
  validationSchema: AnyObjectSchema;
  errors?: Partial<Record<keyof T, string>>;
  disabled?: boolean;
  button: ReactNode;
  onSubmit: (values: T) => unknown | Promise<unknown>;
}

export function CustomForm<T extends Record<keyof T, string>>({
  initialValues,
  fields,
  validationSchema,
  errors,
  disabled = false,
  button,
  onSubmit,
}: CustomFormProps<T>) {
  const formik = useFormik<T>({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const isDisabled = disabled || formik.isSubmitting;

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
      {fields.map((field) => {
        const fieldError = formik.errors[field.name];

        const validationError =
          formik.touched[field.name] && typeof fieldError === "string"
            ? fieldError
            : undefined;

        return (
          <FormField
            key={field.name}
            {...field}
            value={formik.values[field.name]}
            error={validationError ?? errors?.[field.name]}
            disabled={isDisabled}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        );
      })}

      <fieldset disabled={isDisabled} className="flex justify-center">
        {button}
      </fieldset>
    </form>
  );
}
