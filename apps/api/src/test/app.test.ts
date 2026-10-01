import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("API", () => {
  it("responde con 200 y el estado esperado", async () => {
    const response = await request(app).get("/api/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("responde con 404 cuando la ruta no existe", async () => {
    const response = await request(app).get("/api/no-existe");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Ruta no encontrada",
      },
    });
  });
});
