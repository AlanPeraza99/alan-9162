// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Login } from "~/pages/auth/Login";
import { Dashboard } from "~/pages/Dashboard";
import { AuthProvider } from "~/context/AuthContext";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import { LOGIN_FIELDS } from "~/constants/auth/login.constants";
import { api } from "~/services/api";
import type { User } from "~/interfaces/user.interface";
import type { LoginFormValues } from "~/interfaces/auth/login.interface";

const mocks = vi.hoisted(() => ({
  status: "connected" as "connected" | "loading" | "error",
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("~/hooks/useApi", () => ({
  useApi: () => ({ status: mocks.status }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.success,
    error: mocks.error,
  },
}));

const credentials: LoginFormValues = {
  email: "alan@example.com",
  password: "Password123!",
};

const storedUser: User = {
  id: "user-123",
  fullName: "Alan Pérez",
  email: credentials.email,
  balance: 150,
  passwordHash: "a".repeat(128),
  passwordSalt: "b".repeat(32),
};

const loginResponse = {
  message: "Inicio de sesión correcto",
};

const http = vi.fn<AxiosAdapter>();
const originalAdapter = api.defaults.adapter;

function createResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    data: loginResponse,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
}

function setup() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="/estatus" element={<h1>Estado de la API</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

  return userEvent.setup();
}

function getField(name: keyof LoginFormValues) {
  const field = LOGIN_FIELDS.find((field) => field.name === name);

  if (!field) throw new Error(`No existe el campo ${name}`);

  return screen.getByLabelText(field.label);
}

function getSubmitButton() {
  return screen.getByRole("button", {
    name: /iniciar sesión|ingresando/i,
  });
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values: LoginFormValues = credentials,
) {
  for (const field of LOGIN_FIELDS) {
    await user.type(getField(field.name), values[field.name]);
  }
}

function expectDashboard() {
  expect(
    screen.getByRole("button", { name: /cerrar sesión/i }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("status", { name: "Saldo disponible" }),
  ).toBeInTheDocument();
}

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    mocks.status = "connected";

    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(storedUser));

    api.defaults.adapter = http;
    http.mockImplementation(async (config) => createResponse(config));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    api.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it("no envía un formulario vacío y muestra los errores", async () => {
    const user = setup();

    await user.click(getSubmitButton());

    await waitFor(() => {
      for (const field of LOGIN_FIELDS) {
        expect(getField(field.name)).toHaveAttribute("aria-invalid", "true");

        expect(getField(field.name)).toHaveAccessibleDescription(/\S/);
      }
    });

    expect(http).not.toHaveBeenCalled();
  });

  it("no envía un correo inválido", async () => {
    const user = setup();

    await fillForm(user, {
      ...credentials,
      email: "correo-invalido",
    });

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(getField("email")).toHaveAttribute("aria-invalid", "true");
      expect(getField("email")).toHaveAccessibleDescription(/\S/);
    });

    expect(http).not.toHaveBeenCalled();
  });

  it("inicia sesión, entra al dashboard y conserva el saldo", async () => {
    const user = setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(expectDashboard);

    expect(http).toHaveBeenCalledTimes(1);

    const request = http.mock.calls[0]![0];

    expect(request.method).toBe("post");
    expect(request.url).toBe("/auth/login");

    expect(JSON.parse(request.data)).toEqual({
      ...credentials,
      storedUser: {
        email: storedUser.email,
        passwordHash: storedUser.passwordHash,
        passwordSalt: storedUser.passwordSalt,
      },
    });

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBe(storedUser.id);

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(
      JSON.stringify(storedUser),
    );

    expect(mocks.success).toHaveBeenCalledWith(loginResponse.message);
  });

  it("muestra el error del servidor y permite corregir la contraseña", async () => {
    http.mockImplementationOnce(async (config) => {
      throw new AxiosError(
        "Credenciales incorrectas",
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        {
          data: {
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Correo o contraseña incorrectos",
            },
          },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
        },
      );
    });

    const user = setup();

    await fillForm(user, {
      ...credentials,
      password: "Incorrecta123!",
    });

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mocks.error).toHaveBeenCalledWith(
        "Correo o contraseña incorrectos",
      );

      expect(getSubmitButton()).toBeEnabled();
    });

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBeNull();
    expect(mocks.success).not.toHaveBeenCalled();

    await user.clear(getField("password"));
    await user.type(getField("password"), credentials.password);
    await user.click(getSubmitButton());

    await waitFor(expectDashboard);

    expect(http).toHaveBeenCalledTimes(2);
  });

  it("envía una sola petición ante clics repetidos durante la carga", async () => {
    let finishRequest!: () => void;

    http.mockImplementationOnce(
      (config) =>
        new Promise<AxiosResponse>((resolve) => {
          finishRequest = () => resolve(createResponse(config));
        }),
    );

    const user = setup();

    await fillForm(user);

    const button = getSubmitButton();

    await user.dblClick(button);

    await waitFor(() => {
      expect(http).toHaveBeenCalledTimes(1);
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Ingresando...");
    });

    for (const field of LOGIN_FIELDS) {
      expect(getField(field.name)).toBeDisabled();
    }

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(http).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBeNull();

    await act(async () => {
      finishRequest();
    });

    await waitFor(expectDashboard);

    expect(http).toHaveBeenCalledTimes(1);
    expect(mocks.success).toHaveBeenCalledTimes(1);
  });

  it("no llama a la API si no existe una cuenta local", async () => {
    localStorage.clear();

    const user = setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mocks.error).toHaveBeenCalledWith(
        "Primero registra una cuenta en este navegador.",
      );

      expect(getSubmitButton()).toBeEnabled();
    });

    expect(http).not.toHaveBeenCalled();
  });

  it("avisa de un fallo de conexión y permite reintentar", async () => {
    http.mockImplementationOnce(async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
    });

    const user = setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mocks.error).toHaveBeenCalledTimes(1);
      expect(getSubmitButton()).toBeEnabled();
    });

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBeNull();

    await user.click(getSubmitButton());

    await waitFor(expectDashboard);

    expect(http).toHaveBeenCalledTimes(2);
  });

  it("muestra el spinner mientras comprueba la API", () => {
    mocks.status = "loading";

    setup();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Comprobando conexión con la API...",
    );

    expect(
      screen.queryByRole("button", { name: /iniciar sesión/i }),
    ).not.toBeInTheDocument();

    expect(http).not.toHaveBeenCalled();
  });

  it("redirige a estatus si falla la comprobación de la API", async () => {
    mocks.status = "error";

    setup();

    expect(
      await screen.findByRole("heading", {
        name: "Estado de la API",
      }),
    ).toBeInTheDocument();

    expect(http).not.toHaveBeenCalled();
  });
});
