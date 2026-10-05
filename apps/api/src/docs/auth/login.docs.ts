export const loginDocumentation = {
  post: {
    tags: ["Auth"],
    summary: "Iniciar sesión",
    description:
      "Verifica el correo y la contraseña contra los datos del usuario " +
      "guardado en LocalStorage. Es una simulación de autenticación local.",

    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["email", "password", "storedUser"],
            properties: {
              email: {
                type: "string",
                format: "email",
              },
              password: {
                type: "string",
                format: "password",
                maxLength: 128,
              },
              storedUser: {
                type: "object",
                required: ["email", "passwordHash", "passwordSalt"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                  },
                  passwordHash: {
                    type: "string",
                    pattern: "^[a-fA-F0-9]{128}$",
                    description: "Hash devuelto por el registro.",
                  },
                  passwordSalt: {
                    type: "string",
                    pattern: "^[a-fA-F0-9]{32}$",
                    description: "Salt devuelto por el registro.",
                  },
                },
              },
            },
          },

          examples: {
            login: {
              summary: "Formato del login",
              description:
                "Reemplaza storedUser con el correo, hash y salt devueltos " +
                "por /api/auth/register. Usa la contraseña de ese registro.",
              value: {
                email: "alan@example.com",
                password: "Password123!",
                storedUser: {
                  email: "alan@example.com",
                  passwordHash: "a".repeat(128),
                  passwordSalt: "b".repeat(32),
                },
              },
            },
          },
        },
      },
    },

    responses: {
      "200": {
        description: "Credenciales correctas",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["message"],
              properties: {
                message: { type: "string" },
              },
            },
            example: {
              message: "Inicio de sesión correcto",
            },
          },
        },
      },

      "400": {
        description: "Solicitud mal formada",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["error"],
              properties: {
                error: {
                  type: "object",
                  required: ["code", "message"],
                  properties: {
                    code: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
            example: {
              error: {
                code: "INVALID_REQUEST",
                message: "La solicitud no es válida",
              },
            },
          },
        },
      },

      "401": {
        description: "Correo o contraseña incorrectos",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["error"],
              properties: {
                error: {
                  type: "object",
                  required: ["code", "message"],
                  properties: {
                    code: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
            example: {
              error: {
                code: "INVALID_CREDENTIALS",
                message: "Correo o contraseña incorrectos",
              },
            },
          },
        },
      },

      "422": {
        description: "Errores de validación",
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
                    field: "email",
                    message: "El correo no es válido",
                  },
                ],
              },
            },
          },
        },
      },

      "500": {
        description: "Error interno del servidor",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["error"],
              properties: {
                error: {
                  type: "object",
                  required: ["code", "message"],
                  properties: {
                    code: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
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
