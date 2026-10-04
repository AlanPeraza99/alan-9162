export const registerDocumentation = {
  post: {
    tags: ["Auth"],
    summary: "Para poder registrar un usuario",
    description:
      "Valida los datos y devuelve un usuario con saldo inicial de 0. " +
      "Guardar en LocalStorage. ",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["fullName", "email", "password", "confirmPassword"],
            properties: {
              fullName: {
                type: "string",
                description: "Nombre completo; no puede estar vacío.",
              },
              email: {
                type: "string",
                format: "email",
                description: "Se normaliza a minúsculas.",
              },
              password: {
                type: "string",
                format: "password",
                minLength: 8,
                maxLength: 128,
              },
              confirmPassword: {
                type: "string",
                format: "password",
                description: "Debe coincidir con password.",
              },
            },
          },
          examples: {
            validRegistration: {
              summary: "Registro válido",
              value: {
                fullName: "Usuario de prueba",
                email: "usuario@example.com",
                password: "Prueba12345",
                confirmPassword: "Prueba12345",
              },
            },
            passwordMismatch: {
              summary: "Confirmación diferente: devuelve 422",
              value: {
                fullName: "Usuario de prueba",
                email: "usuario@example.com",
                password: "Prueba12345",
                confirmPassword: "OtraClave123",
              },
            },
          },
        },
      },
    },

    responses: {
      "201": {
        description: "Usuario preparado correctamente",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["message", "user"],
              properties: {
                message: { type: "string" },
                user: {
                  type: "object",
                  required: [
                    "id",
                    "fullName",
                    "email",
                    "balance",
                    "passwordHash",
                    "passwordSalt",
                  ],
                  properties: {
                    id: { type: "string", format: "uuid" },
                    fullName: { type: "string" },
                    email: { type: "string", format: "email" },
                    balance: { type: "number", enum: [0] },
                    passwordHash: {
                      type: "string",
                      description: "Hash scrypt en hexadecimal.",
                    },
                    passwordSalt: {
                      type: "string",
                      description: "Salt aleatorio en hexadecimal.",
                    },
                  },
                },
              },
            },
          },
        },
      },

      "400": {
        description: "Solicitud mal formada, como JSON inválido",
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

      "422": {
        description: "Los datos no cumplen las validaciones",
        content: {
          "application/json": {
            example: {
              error: {
                code: "VALIDATION_ERROR",
                message: "Revisa los datos del formulario",
                details: [
                  {
                    field: "confirmPassword",
                    message: "Las contraseñas no coinciden",
                  },
                ],
              },
            },
          },
        },
      },

      "500": {
        description: "Error interno inesperado",
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
