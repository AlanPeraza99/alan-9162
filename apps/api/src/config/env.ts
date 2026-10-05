import * as yup from "yup";

const envSchema = yup.object({
  PORT: yup.number().integer().min(1).max(65535).default(3000),

  FRONTEND_ORIGIN: yup
    .string()
    .default("http://localhost:5173")
    .test(
      "http-origin",
      "FRONTEND_ORIGIN debe ser un origen HTTP o HTTPS, sin rutas",
      (value) => {
        if (!value) return false;

        try {
          const url = new URL(value);

          return (
            ["http:", "https:"].includes(url.protocol) && value === url.origin
          );
        } catch {
          return false;
        }
      },
    ),

  API_BASE_URL: yup
    .string()
    .default(`http://localhost:${process.env.PORT ?? 3000}`)
    .test(
      "api-origin",
      "API_BASE_URL debe ser un origen HTTP o HTTPS, sin rutas",
      (value) => {
        if (!value) return false;

        try {
          const url = new URL(value);

          return (
            ["http:", "https:"].includes(url.protocol) && value === url.origin
          );
        } catch {
          return false;
        }
      },
    ),
  SNAILPAY_ENCRYPTION_KEY: yup
    .string()
    .required("SNAILPAY_ENCRYPTION_KEY es obligatoria")
    .matches(
      /^[a-f0-9]{64}$/i,
      "SNAILPAY_ENCRYPTION_KEY debe contener 64 caracteres hexadecimales",
    ),
});

export const env = envSchema.validateSync(
  {
    PORT: process.env.PORT,
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
    API_BASE_URL: process.env.API_BASE_URL,
    SNAILPAY_ENCRYPTION_KEY: process.env.SNAILPAY_ENCRYPTION_KEY,
  },
  {
    abortEarly: false,
    stripUnknown: true,
  },
);
