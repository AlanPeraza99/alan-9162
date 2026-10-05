import request from "supertest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "../../app.js";
import { hashPassword } from "../../utils/password.util.js";
import * as loginService from "../../services/auth/login.service.js";
import type { LoginRequest } from "../../interfaces/auth/login.interface.js";

const credentials = {
  email: "alan@example.com",
  password: "Password123!",
};

let validPayload: LoginRequest;

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    const password = await hashPassword(credentials.password);

    validPayload = {
      ...credentials,
      storedUser: {
        email: credentials.email,
        ...password,
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve 200 cuando las credenciales son correctas", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Inicio de sesión correcto",
    });
  });

  it("devuelve 401 cuando la contraseña es incorrecta", async () => {
    const invalidPasswordPayload = {
      ...validPayload,
      password: "OtraPassword123!",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(invalidPasswordPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Correo o contraseña incorrectos",
      },
    });
  });

  it("devuelve 401 cuando el correo no coincide", async () => {
    const differentEmailPayload = {
      ...validPayload,
      email: "otro@example.com",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(differentEmailPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Correo o contraseña incorrectos",
      },
    });
  });

  it("devuelve 422 cuando faltan los campos obligatorios", async () => {
    const emptyPayload = {};

    const response = await request(app)
      .post("/api/auth/login")
      .send(emptyPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
        expect.objectContaining({ field: "storedUser" }),
      ]),
    );
  });

  it("devuelve 422 cuando el correo es inválido", async () => {
    const invalidEmailPayload = {
      ...validPayload,
      email: "correo-invalido",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(invalidEmailPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "email" })]),
    );
  });

  it("devuelve 422 cuando el hash es inválido", async () => {
    const invalidHashPayload = {
      ...validPayload,
      storedUser: {
        ...validPayload.storedUser,
        passwordHash: "hash-invalido",
      },
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(invalidHashPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "storedUser.passwordHash",
        }),
      ]),
    );
  });

  it("devuelve 422 cuando el salt es inválido", async () => {
    const invalidSaltPayload = {
      ...validPayload,
      storedUser: {
        ...validPayload.storedUser,
        passwordSalt: "salt-invalido",
      },
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(invalidSaltPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "storedUser.passwordSalt",
        }),
      ]),
    );
  });

  it("devuelve 400 cuando el JSON está mal formado", async () => {
    const malformedJson = '{"email":';

    const response = await request(app)
      .post("/api/auth/login")
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

  it("devuelve 500 sin exponer detalles internos cuando falla el servicio", async () => {
    vi.spyOn(loginService, "loginUser").mockRejectedValueOnce(
      new Error("Detalle interno que no debe mostrarse"),
    );

    const response = await request(app)
      .post("/api/auth/login")
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
