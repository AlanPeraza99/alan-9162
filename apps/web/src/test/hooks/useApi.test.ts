import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useApi } from "~/hooks/useApi";
import { api } from "~/services/api";

// Sustituimos la petición real por una función controlada.
vi.mock("~/services/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(api.get).mockReset();
});

it("muestra connected cuando la API responde correctamente", async () => {
  vi.mocked(api.get).mockResolvedValue({
    status: 200,
    data: { status: "ok" },
  });

  const { result } = renderHook(() => useApi());
  await waitFor(() => {
    expect(result.current.status).toBe("connected");
  });
});

it("muestra error cuando falla la conexión", async () => {
  vi.mocked(api.get).mockRejectedValue(new Error("No hay conexión"));

  const { result } = renderHook(() => useApi());

  await waitFor(() => {
    expect(result.current.status).toBe("error");
  });
});
