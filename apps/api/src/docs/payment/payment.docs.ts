const paymentResponseSchema = {
  type: "object",
  required: [
    "id",
    "status",
    "status_detail",
    "transaction_amount",
    "date_created",
    "authorization_code",
    "reference",
    "payer_id",
    "payer_email",
    "card_number",
    "cvv",
    "message",
  ],
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
    status: {
      type: "string",
      enum: ["approved", "rejected", "error"],
    },
    status_detail: {
      type: "string",
      enum: [
        "accredited",
        "card_declined",
        "invalid_card_data",
        "system_error",
      ],
    },
    transaction_amount: {
      type: "number",
    },
    date_created: {
      type: "string",
      format: "date-time",
    },
    authorization_code: {
      type: "string",
      nullable: true,
    },
    reference: {
      type: "string",
    },
    payer_id: {
      type: "string",
    },
    payer_email: {
      type: "string",
      format: "email",
    },
    card_number: {
      type: "string",
      description: "Número ficticio de la tarjeta de prueba.",
    },
    cvv: {
      type: "string",
      description: "CVV ficticio de prueba.",
    },
    message: {
      type: "string",
    },
  },
};

const paymentExample = {
  id: "cf9fb398-dfe4-44c1-b00d-20ac229e2036",
  status: "approved",
  status_detail: "accredited",
  transaction_amount: 100,
  date_created: "2026-10-05T01:00:00.000Z",
  authorization_code: "a758d7b5-17b7-49fd-a5fb-852a532716ee",
  reference: "SNAIL-f2195116-df47-4329-97c8-5108a62bfcb4",
  payer_id: "user-123",
  payer_email: "alan@example.com",
  card_number: "1234123412341234",
  cvv: "543",
  message: "Recarga aprobada correctamente",
};

const paymentRequestExample = {
  cardNumber: "1234123412341234",
  expirationDate: "12/26",
  cvv: "543",
  fullName: "Alan Pérez",
  amount: 100,
  payerId: "user-123",
  payerEmail: "alan@example.com",
};

export const paymentDocumentation = {
  post: {
    tags: ["SnailPay"],
    summary: "Procesar una recarga simulada",
    description:
      "Solo acepta tarjetas ficticias de prueba. " +
      "1234123412341234 con vencimiento 12/26 y CVV 543 aprueba el pago. " +
      "4000000000000002 simula una tarjeta rechazada. " +
      "5000000000000000 simula un fallo del sistema. " +
      "Todos los escenarios requieren un payload válido. " +
      "El frontend únicamente debe aumentar el saldo cuando status sea approved. " +
      "La tarjeta y el CVV devueltos son ficticios.",

    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: [
              "cardNumber",
              "expirationDate",
              "cvv",
              "fullName",
              "amount",
              "payerId",
              "payerEmail",
            ],
            properties: {
              cardNumber: {
                type: "string",
                enum: [
                  "1234123412341234",
                  "4000000000000002",
                  "5000000000000000",
                ],
              },
              expirationDate: {
                type: "string",
                pattern: "^(0[1-9]|1[0-2])/\\d{2}$",
                example: "12/26",
              },
              cvv: {
                type: "string",
                pattern: "^\\d{3}$",
                example: "543",
              },
              fullName: {
                type: "string",
                minLength: 1,
              },
              amount: {
                type: "number",
                minimum: 0,
                exclusiveMinimum: true,
                maximum: Number.MAX_SAFE_INTEGER / 100,
                multipleOf: 0.01,
              },
              payerId: {
                type: "string",
                minLength: 1,
              },
              payerEmail: {
                type: "string",
                format: "email",
              },
            },
          },

          examples: {
            approved: {
              summary: "Pago aprobado",
              value: paymentRequestExample,
            },
            rejected: {
              summary: "Tarjeta rechazada",
              value: {
                ...paymentRequestExample,
                cardNumber: "4000000000000002",
              },
            },
            invalidCardData: {
              summary: "CVV incorrecto para la tarjeta aprobada",
              value: {
                ...paymentRequestExample,
                cvv: "111",
              },
            },
            systemError: {
              summary: "Fallo interno simulado",
              value: {
                ...paymentRequestExample,
                cardNumber: "5000000000000000",
              },
            },
          },
        },
      },
    },

    responses: {
      "200": {
        description:
          "Operación procesada. Puede estar aprobada o rechazada; revisar status.",
        content: {
          "application/json": {
            schema: paymentResponseSchema,
            examples: {
              approved: {
                summary: "Recarga aprobada",
                value: paymentExample,
              },
              rejected: {
                summary: "Tarjeta rechazada",
                value: {
                  ...paymentExample,
                  status: "rejected",
                  status_detail: "card_declined",
                  authorization_code: null,
                  card_number: "4000000000000002",
                  message: "La tarjeta de prueba fue rechazada",
                },
              },
              invalidCardData: {
                summary: "Datos de tarjeta incorrectos",
                value: {
                  ...paymentExample,
                  status: "rejected",
                  status_detail: "invalid_card_data",
                  authorization_code: null,
                  cvv: "111",
                  message:
                    "El vencimiento o el CVV de la tarjeta de prueba no coinciden",
                },
              },
            },
          },
        },
      },

      "503": {
        description:
          "Fallo simulado de SnailPay. No debe aplicarse ninguna recarga.",
        content: {
          "application/json": {
            schema: paymentResponseSchema,
            example: {
              ...paymentExample,
              status: "error",
              status_detail: "system_error",
              authorization_code: null,
              card_number: "5000000000000000",
              message: "SnailPay no está disponible. Intenta nuevamente",
            },
          },
        },
      },

      "422": {
        description: "Datos de entrada inválidos",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["error"],
              properties: {
                error: {
                  type: "object",
                  required: ["code", "message", "details"],
                  properties: {
                    code: { type: "string" },
                    message: { type: "string" },
                    details: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["field", "message"],
                        properties: {
                          field: {
                            type: "string",
                            nullable: true,
                          },
                          message: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            example: {
              error: {
                code: "VALIDATION_ERROR",
                message: "Revisa los datos del formulario",
                details: [
                  {
                    field: "amount",
                    message: "El monto debe ser mayor que cero",
                  },
                ],
              },
            },
          },
        },
      },

      "400": {
        description: "JSON mal formado",
        content: {
          "application/json": {
            example: {
              error: {
                code: "INVALID_REQUEST",
                message: "La solicitud no es válida",
              },
            },
          },
        },
      },

      "500": {
        description: "Fallo inesperado del backend",
        content: {
          "application/json": {
            example: {
              error: {
                code: "INTERNAL_ERROR",
                message: "Ocurrió un error interno",
              },
            },
          },
        },
      },
    },
  },
};
