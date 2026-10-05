import * as yup from "yup";
import type { PaymentFormValues } from "~/interfaces/payment/payment.interface";

export const paymentSchema: yup.ObjectSchema<PaymentFormValues> = yup.object({
  fullName: yup.string().trim().required("El nombre completo es obligatorio"),

  cardNumber: yup
    .string()
    .trim()
    .oneOf(
      ["1234123412341234", "4000000000000002", "5000000000000000"],
      "Utiliza una de las tarjetas ficticias de prueba",
    )
    .required("La tarjeta es obligatoria"),

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

  amount: yup
    .string()
    .trim()
    .required("El monto es obligatorio")
    .matches(
      /^\d+(\.\d{1,2})?$/,
      "Ingresa un monto con hasta dos decimales y utiliza punto decimal",
    )
    .test(
      "positive",
      "El monto debe ser mayor que cero",
      (value) => !value || Number(value) > 0,
    )
    .test(
      "maximum",
      "El monto supera el límite permitido",
      (value) => !value || Number(value) <= Number.MAX_SAFE_INTEGER / 100,
    ),
});
