import type { FormFieldConfig } from "~/components/form/CustomForm";
import type { LoginFormValues } from "~/interfaces/auth/login.interface";

export const LOGIN_INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export const LOGIN_FIELDS: FormFieldConfig<LoginFormValues>[] = [
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    autoComplete: "current-password",
  },
];
