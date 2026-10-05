import * as yup from "yup";
import { TEST_CARDS } from "../../constants/payment/payment.constants.js";
import type { PaymentRequest } from "../../interfaces/payment/payment.interface.js";

export const paymentSchema: yup.ObjectSchema<PaymentRequest> = yup.object({
  cardNumber: yup
    .string()
    .trim()
    .oneOf(
      Object.values(TEST_CARDS),
      "Utiliza una de las tarjetas ficticias de prueba",
    )
    .required("El número de tarjeta es obligatorio"),

  expirationDate: yup
    .string()
    .trim()
    .matches(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "El vencimiento debe tener el formato MM/AA",
    )
    .required("El vencimiento es obligatorio"),

  cvv: yup
    .string()
    .trim()
    .matches(/^\d{3}$/, "El CVV debe contener tres dígitos")
    .required("El CVV es obligatorio"),

  fullName: yup.string().trim().required("El nombre completo es obligatorio"),

  amount: yup
    .number()
    .typeError("El monto debe ser un número")
    .positive("El monto debe ser mayor que cero")
    .max(Number.MAX_SAFE_INTEGER / 100, "El monto supera el límite permitido")
    .test(
      "decimal-places",
      "El monto debe tener como máximo dos decimales",
      (value) => value == null || value === Number(value.toFixed(2)),
    )
    .required("El monto es obligatorio"),

  payerId: yup
    .string()
    .trim()
    .required("El identificador del usuario es obligatorio"),

  payerEmail: yup
    .string()
    .trim()
    .lowercase()
    .email("El correo del usuario no es válido")
    .required("El correo del usuario es obligatorio"),
});
