import { randomUUID } from "node:crypto";
import {
  APPROVED_CARD,
  TEST_CARDS,
} from "../../constants/payment/payment.constants.js";
import type {
  PaymentRequest,
  PaymentResponse,
} from "../../interfaces/payment/payment.interface.js";
import { paymentSchema } from "../../schemas/payment/payment.schema.js";

export async function processPayment(
  input: PaymentRequest,
): Promise<PaymentResponse> {
  const data = await paymentSchema.validate(input, {
    abortEarly: false,
    stripUnknown: true,
  });

  const payment: PaymentResponse = {
    id: randomUUID(),
    status: "rejected",
    status_detail: "card_declined",
    transaction_amount: data.amount,
    date_created: new Date().toISOString(),
    authorization_code: null,
    reference: `SNAIL-${randomUUID()}`,
    payer_id: data.payerId,
    payer_email: data.payerEmail,
    card_number: data.cardNumber,
    cvv: data.cvv,
    message: "La tarjeta de prueba fue rechazada",
  };

  if (data.cardNumber === TEST_CARDS.systemError) {
    return {
      ...payment,
      status: "error",
      status_detail: "system_error",
      message: "SnailPay no está disponible. Intenta nuevamente",
    };
  }

  if (data.cardNumber === TEST_CARDS.rejected) {
    return payment;
  }

  const validCardData =
    data.expirationDate === APPROVED_CARD.expirationDate &&
    data.cvv === APPROVED_CARD.cvv;

  if (!validCardData) {
    return {
      ...payment,
      status_detail: "invalid_card_data",
      message: "El vencimiento o el CVV de la tarjeta de prueba no coinciden",
    };
  }

  return {
    ...payment,
    status: "approved",
    status_detail: "accredited",
    authorization_code: randomUUID(),
    message: "Recarga aprobada correctamente",
  };
}
