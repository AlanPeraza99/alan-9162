import type { FormFieldConfig } from "~/components/form/CustomForm";
import type { PaymentFormValues } from "~/interfaces/payment/payment.interface";

export const PAYMENT_STORAGE_KEY = "caracoles.lastPayment";

export const PAYMENT_INITIAL_VALUES: PaymentFormValues = {
  cardNumber: "",
  expirationDate: "",
  cvv: "",
  fullName: "",
  amount: "",
};

export const PAYMENT_FIELDS: FormFieldConfig<PaymentFormValues>[] = [
  {
    name: "fullName",
    label: "Nombre completo",
    type: "text",
    autoComplete: "off",
  },
  {
    name: "cardNumber",
    label: "Tarjeta ficticia",
    type: "text",
    placeholder: "1234123412341234",
    autoComplete: "off",
  },
  {
    name: "expirationDate",
    label: "Vencimiento",
    type: "text",
    placeholder: "12/26",
    autoComplete: "off",
  },
  {
    name: "cvv",
    label: "CVV ficticio",
    type: "text",
    placeholder: "543",
    autoComplete: "off",
  },
  {
    name: "amount",
    label: "Monto de la recarga",
    type: "text",
    placeholder: "100.00",
    autoComplete: "off",
  },
];
