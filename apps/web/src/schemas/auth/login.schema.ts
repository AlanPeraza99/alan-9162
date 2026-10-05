import * as yup from "yup";
import type { LoginFormValues } from "~/interfaces/auth/login.interface";

export const loginSchema: yup.ObjectSchema<LoginFormValues> = yup.object({
  email: yup
    .string()
    .trim()
    .email("El correo no es válido")
    .required("El correo es obligatorio"),

  password: yup
    .string()
    .max(128, "La contraseña es demasiado larga")
    .required("La contraseña es obligatoria"),
});
