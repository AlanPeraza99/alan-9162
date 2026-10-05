import type { ComponentProps } from "react";

export type FormFieldType = "text" | "email" | "password";

interface FormFieldProps {
  name: string;
  label: string;
  value: string;
  type?: FormFieldType;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  onChange: ComponentProps<"input">["onChange"];
  onBlur: ComponentProps<"input">["onBlur"];
}

export const FormField = ({
  name,
  label,
  value,
  type = "text",
  placeholder,
  autoComplete,
  error,
  disabled,
  onChange,
  onBlur,
}: FormFieldProps) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-stone-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-stone-900 outline-none disabled:opacity-50 ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        }`}
      />

      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};
