import * as yup from "yup";
import type { RegisterRequest } from "../../interfaces/auth/register.interface";

export const registerSchema: yup.ObjectSchema<RegisterRequest> = yup.object({
  fullName: yup.string().trim().required("El nombre completo es obligatorio"),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email("El correo no es válido")
    .required("El correo es obligatorio"),

  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña no debe superar 128 caracteres")
    .required("La contraseña es obligatoria"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});
