import * as yup from "yup";
import type { LoginRequest } from "../../interfaces/auth/login.interface.js";

export const loginSchema: yup.ObjectSchema<LoginRequest> = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("El correo no es válido")
    .required("El correo es obligatorio"),

  password: yup
    .string()
    .max(128, "La contraseña es demasiado larga")
    .required("La contraseña es obligatoria"),

  storedUser: yup
    .object({
      email: yup
        .string()
        .trim()
        .lowercase()
        .email("El correo guardado no es válido")
        .required("Falta el correo del usuario guardado"),

      passwordHash: yup
        .string()
        .matches(/^[a-f0-9]{128}$/i, "El hash no es válido")
        .required("Falta el hash de la contraseña"),

      passwordSalt: yup
        .string()
        .matches(/^[a-f0-9]{32}$/i, "El salt no es válido")
        .required("Falta el salt de la contraseña"),
    })
    .required("Faltan los datos del usuario guardado")
    .default(undefined),
});
