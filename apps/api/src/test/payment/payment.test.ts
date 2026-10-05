import { createDecipheriv } from "node:crypto";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { app } from "../../app.js";
import { env } from "../../config/env.js";
import {
  APPROVED_CARD,
  TEST_CARDS,
} from "../../constants/payment/payment.constants.js";
import * as paymentService from "../../services/payment/payment.service.js";
import type {
  PaymentRequest,
  PaymentResponse,
} from "../../interfaces/payment/payment.interface.js";

const validPayload: PaymentRequest = {
  cardNumber: TEST_CARDS.approved,
  expirationDate: APPROVED_CARD.expirationDate,
  cvv: APPROVED_CARD.cvv,
  fullName: "Alan Pérez",
  amount: 100,
  payerId: "user-123",
  payerEmail: "alan@example.com",
};

const encryptedFormat = /^v1:[a-f0-9]{24}:[a-f0-9]{32}:[a-f0-9]+$/;

// Se utiliza únicamente para verificar el cifrado en las pruebas.
function decryptForTest(value: string): string {
  const [, iv, tag, encrypted] = value.split(":");

  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(env.SNAILPAY_ENCRYPTION_KEY, "hex"),
    Buffer.from(iv!, "hex"),
    { authTagLength: 16 },
  );

  decipher.setAuthTag(Buffer.from(tag!, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted!, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

function expectOperation(payment: PaymentResponse, payload: PaymentRequest) {
  expect(payment).toEqual({
    id: expect.any(String),
    status: expect.any(String),
    status_detail: expect.any(String),
    transaction_amount: payload.amount,
    date_created: expect.any(String),
    authorization_code:
      payment.status === "approved" ? expect.any(String) : null,
    reference: expect.any(String),
    payer_id: payload.payerId,
    payer_email: payload.payerEmail,
    card_number: expect.any(String),
    cvv: expect.any(String),
    card_last_four: payload.cardNumber.slice(-4),
    message: expect.any(String),
  });

  expect(payment.id).toMatch(
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i,
  );

  expect(payment.reference).toMatch(/^SNAIL-/);
  expect(Number.isNaN(Date.parse(payment.date_created))).toBe(false);
  expect(payment.message.trim()).not.toBe("");

  expect(payment.card_number).toMatch(encryptedFormat);
  expect(payment.cvv).toMatch(encryptedFormat);

  expect(payment.card_number).not.toBe(payload.cardNumber);
  expect(payment.cvv).not.toBe(payload.cvv);

  expect(decryptForTest(payment.card_number)).toBe(payload.cardNumber);
  expect(decryptForTest(payment.cvv)).toBe(payload.cvv);
}

describe("POST /api/snailpay/payments", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("aprueba el pago y devuelve tarjeta y CVV cifrados", async () => {
    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(validPayload);

    expect(response.status).toBe(200);
    expectOperation(response.body, validPayload);

    expect(response.body.status).toBe("approved");
    expect(response.body.status_detail).toBe("accredited");
    expect(response.body.authorization_code).not.toBe("");
    expect(response.body.message).toBe("Recarga aprobada correctamente");
  });

  it("acepta un monto positivo con dos decimales", async () => {
    const decimalPayload = {
      ...validPayload,
      amount: 25.5,
    };

    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(decimalPayload);

    expect(response.status).toBe(200);
    expectOperation(response.body, decimalPayload);
    expect(response.body.status).toBe("approved");
  });

  it("rechaza la tarjeta configurada y conserva los campos cifrados", async () => {
    const rejectedPayload = {
      ...validPayload,
      cardNumber: TEST_CARDS.rejected,
    };

    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(rejectedPayload);

    expect(response.status).toBe(200);
    expectOperation(response.body, rejectedPayload);

    expect(response.body.status).toBe("rejected");
    expect(response.body.status_detail).toBe("card_declined");
    expect(response.body.authorization_code).toBeNull();
  });

  it.each([
    {
      caseName: "el CVV no coincide",
      payload: { ...validPayload, cvv: "111" },
    },
    {
      caseName: "el vencimiento no coincide",
      payload: { ...validPayload, expirationDate: "11/26" },
    },
  ])("rechaza el pago cuando $caseName", async ({ payload }) => {
    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(payload);

    expect(response.status).toBe(200);
    expectOperation(response.body, payload);

    expect(response.body.status).toBe("rejected");
    expect(response.body.status_detail).toBe("invalid_card_data");
    expect(response.body.authorization_code).toBeNull();
  });

  it("devuelve 503 con tarjeta y CVV cifrados durante el fallo simulado", async () => {
    const systemErrorPayload = {
      ...validPayload,
      cardNumber: TEST_CARDS.systemError,
    };

    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(systemErrorPayload);

    expect(response.status).toBe(503);
    expectOperation(response.body, systemErrorPayload);

    expect(response.body.status).toBe("error");
    expect(response.body.status_detail).toBe("system_error");
    expect(response.body.authorization_code).toBeNull();
  });

  it("devuelve 422 cuando faltan los campos obligatorios", async () => {
    const emptyPayload = {};

    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(emptyPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining(
        Object.keys(validPayload).map((field) =>
          expect.objectContaining({ field }),
        ),
      ),
    );
  });

  it.each([
    {
      caseName: "el monto es cero",
      payload: { ...validPayload, amount: 0 },
      field: "amount",
    },
    {
      caseName: "el monto es negativo",
      payload: { ...validPayload, amount: -100 },
      field: "amount",
    },
    {
      caseName: "el monto tiene más de dos decimales",
      payload: { ...validPayload, amount: 10.123 },
      field: "amount",
    },
    {
      caseName: "la tarjeta no está entre las de prueba",
      payload: { ...validPayload, cardNumber: "1111111111111111" },
      field: "cardNumber",
    },
    {
      caseName: "el vencimiento tiene un formato inválido",
      payload: { ...validPayload, expirationDate: "13/26" },
      field: "expirationDate",
    },
    {
      caseName: "el CVV tiene un formato inválido",
      payload: { ...validPayload, cvv: "ab" },
      field: "cvv",
    },
    {
      caseName: "el nombre está vacío",
      payload: { ...validPayload, fullName: "   " },
      field: "fullName",
    },
    {
      caseName: "el ID del usuario está vacío",
      payload: { ...validPayload, payerId: "" },
      field: "payerId",
    },
    {
      caseName: "el correo es inválido",
      payload: { ...validPayload, payerEmail: "correo-invalido" },
      field: "payerEmail",
    },
  ])("devuelve 422 cuando $caseName", async ({ payload, field }) => {
    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(payload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });

  it("genera operaciones y valores cifrados diferentes para solicitudes iguales", async () => {
    const first = await request(app)
      .post("/api/snailpay/payments")
      .send(validPayload);

    const second = await request(app)
      .post("/api/snailpay/payments")
      .send(validPayload);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    expectOperation(first.body, validPayload);
    expectOperation(second.body, validPayload);

    expect(first.body.id).not.toBe(second.body.id);
    expect(first.body.reference).not.toBe(second.body.reference);
    expect(first.body.card_number).not.toBe(second.body.card_number);
    expect(first.body.cvv).not.toBe(second.body.cvv);
  });

  it("devuelve 400 cuando el JSON está mal formado", async () => {
    const malformedJson = '{"amount":';

    const response = await request(app)
      .post("/api/snailpay/payments")
      .set("Content-Type", "application/json")
      .send(malformedJson);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "La solicitud no es válida",
      },
    });
  });

  it("devuelve 500 sin exponer detalles cuando ocurre un fallo inesperado", async () => {
    vi.spyOn(paymentService, "processPayment").mockRejectedValueOnce(
      new Error("Detalle interno que no debe mostrarse"),
    );

    const response = await request(app)
      .post("/api/snailpay/payments")
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error interno",
      },
    });
  });
});
