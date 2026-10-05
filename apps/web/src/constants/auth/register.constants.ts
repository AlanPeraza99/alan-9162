import type { RegisterRequest } from "~/interfaces/auth/register.interface";
import type { FormFieldConfig } from "~/components/form/CustomForm";

export const REGISTER_INITIAL_VALUES: RegisterRequest = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const REGISTER_FIELDS: FormFieldConfig<RegisterRequest>[] = [
  {
    name: "fullName",
    label: "Nombre completo",
    type: "text",
    autoComplete: "name",
  },
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
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirma tu contraseña",
    type: "password",
    autoComplete: "new-password",
  },
];
