import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import * as registerService from "../../services/auth/register.service.js";

const validPayload = {
  fullName: "Usuario de prueba",
  email: "usuario@example.com",
  password: "Prueba12345",
  confirmPassword: "Prueba12345",
};

const invalidEmailPayload = {
  ...validPayload,
  email: "correo-invalido",
};

const shortPasswordPayload = {
  ...validPayload,
  password: "123",
  confirmPassword: "123",
};

const passwordMismatchPayload = {
  ...validPayload,
  confirmPassword: "OtraClave123",
};

const customBalancePayload = {
  ...validPayload,
  balance: 10000,
};

const malformedJsonPayload = '{"email":';

describe("POST /api/auth/register", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve 201 con el usuario preparado y sin contraseña original", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Te has registrado exitosamente");

    expect(response.body.user).toMatchObject({
      fullName: validPayload.fullName,
      email: validPayload.email,
      balance: 0,
    });

    expect(response.body.user.id).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i,
    );
    expect(response.body.user.passwordHash).toMatch(/^[a-f0-9]{128}$/i);
    expect(response.body.user.passwordSalt).toMatch(/^[a-f0-9]{32}$/i);

    expect(response.body.user).not.toHaveProperty("password");
    expect(response.body.user).not.toHaveProperty("confirmPassword");
  });

  it("devuelve 422 cuando faltan los campos obligatorios", async () => {
    const response = await request(app).post("/api/auth/register").send({});

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "fullName" }),
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
        expect.objectContaining({ field: "confirmPassword" }),
      ]),
    );
  });

  it("devuelve 422 cuando el correo es inválido", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidEmailPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "email" })]),
    );
  });

  it("devuelve 422 cuando la contraseña es demasiado corta", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(shortPasswordPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "password" })]),
    );
  });

  it("devuelve 422 cuando las contraseñas no coinciden", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(passwordMismatchPayload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "confirmPassword" }),
      ]),
    );
  });

  it("devuelve 400 cuando el JSON está mal formado", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send(malformedJsonPayload);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REQUEST");
  });

  it("mantiene el saldo inicial en cero aunque el cliente envíe otro", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(customBalancePayload);

    expect(response.status).toBe(201);
    expect(response.body.user.balance).toBe(0);
  });

  it("devuelve 500 sin exponer detalles internos cuando falla el servicio", async () => {
    vi.spyOn(registerService, "registerUser").mockRejectedValueOnce(
      new Error("Detalle interno que no debe exponerse"),
    );

    const response = await request(app)
      .post("/api/auth/register")
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
