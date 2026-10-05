import { env } from "../config/env.js";
import { registerDocumentation } from "./auth/register.docs.js";
import { loginDocumentation } from "./auth/login.docs.js";
import { paymentDocumentation } from "./payment/payment.docs.js";

export const openApiDocument = {
  openapi: "3.0.3",

  info: {
    title: "Caracoles API",
    version: "1.0.0",
    description:
      "Documentación de PROYECTO.\n\n" +
      "[Descargar OpenAPI JSON](/api/docs/openapi.json)",
  },

  servers: [
    {
      url: env.API_BASE_URL,
      description: "Servidor configurado",
    },
  ],

  paths: {
    "/api/auth/register": registerDocumentation,
    "/api/auth/login": loginDocumentation,
    "/api/snailpay/payments": paymentDocumentation,
    "/api/": {
      get: {
        tags: ["Sistema"],
        summary: "Consultar el estado del API",
        responses: {
          "200": {
            description: "API disponible",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["ok"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
