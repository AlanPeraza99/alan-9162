// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Register } from "~/pages/auth/Register";
import { AuthProvider } from "~/context/AuthContext";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/services/api";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import { REGISTER_FIELDS } from "~/constants/auth/register.constants";
import type { RegisterRequest } from "~/interfaces/auth/register.interface";

const notifications = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: notifications,
}));

const validPayload: RegisterRequest = {
  fullName: "Alan Pérez",
  email: "alan@example.com",
  password: "Password123!",
  confirmPassword: "Password123!",
};

const successfulResponse = {
  message: "Usuario preparado correctamente",
  user: {
    id: "user-123",
    fullName: "Alan Pérez",
    email: "alan@example.com",
    balance: 0,
    passwordHash: "a".repeat(128),
    passwordSalt: "b".repeat(32),
  },
};

const http = vi.fn<AxiosAdapter>();
const originalAdapter = api.defaults.adapter;

function createResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    data: successfulResponse,
    status: 201,
    statusText: "Created",
    headers: {},
    config,
  };
}

// Permite observar el estado compartido, no solo LocalStorage.
function SessionStatus() {
  const { user } = useAuth();

  return (
    <output aria-label="Usuario de la sesión">
      {user?.email ?? "Sin sesión"}
    </output>
  );
}

function setup() {
  const view = render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
        <SessionStatus />
      </AuthProvider>
    </MemoryRouter>,
  );

  return {
    ...view,
    user: userEvent.setup(),
  };
}

function getField(name: keyof RegisterRequest) {
  const field = REGISTER_FIELDS.find((field) => field.name === name);

  if (!field) {
    throw new Error(`No existe el campo ${name}`);
  }

  return screen.getByLabelText(field.label);
}

function getSubmitButton() {
  return screen.getByRole("button", {
    name: /crear cuenta|registrando/i,
  });
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values: RegisterRequest = validPayload,
) {
  for (const field of REGISTER_FIELDS) {
    await user.type(getField(field.name), values[field.name]);
  }
}

describe("Registro de usuario", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();

    api.defaults.adapter = http;

    http.mockImplementation(async (config) => createResponse(config));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    api.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it("no muestra errores antes de interactuar con el formulario", () => {
    setup();

    for (const field of REGISTER_FIELDS) {
      expect(getField(field.name)).toHaveAttribute("aria-invalid", "false");
    }

    expect(getSubmitButton()).toBeEnabled();
    expect(http).not.toHaveBeenCalled();
  });

  it("muestra errores y no envía un formulario vacío", async () => {
    const { user } = setup();

    await user.click(getSubmitButton());

    await waitFor(() => {
      for (const field of REGISTER_FIELDS) {
        expect(getField(field.name)).toHaveAttribute("aria-invalid", "true");

        expect(getField(field.name)).toHaveAccessibleDescription(/\S/);
      }
    });

    expect(http).not.toHaveBeenCalled();
    expect(getSubmitButton()).toBeEnabled();
  });

  it.each([
    {
      caseName: "el correo es inválido",
      values: { ...validPayload, email: "correo-invalido" },
      field: "email" as const,
    },
    {
      caseName: "la contraseña es demasiado corta",
      values: {
        ...validPayload,
        password: "123",
        confirmPassword: "123",
      },
      field: "password" as const,
    },
    {
      caseName: "las contraseñas no coinciden",
      values: {
        ...validPayload,
        confirmPassword: "OtraPassword123!",
      },
      field: "confirmPassword" as const,
    },
  ])("no envía cuando $caseName", async ({ values, field }) => {
    const { user } = setup();

    await fillForm(user, values);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(getField(field)).toHaveAttribute("aria-invalid", "true");
      expect(getField(field)).toHaveAccessibleDescription(/\S/);
    });

    expect(http).not.toHaveBeenCalled();
  });

  it("muestra el error al salir del campo y lo elimina al corregirlo", async () => {
    const { user } = setup();
    const email = getField("email");

    await user.type(email, "correo-invalido");
    await user.tab();

    await waitFor(() => {
      expect(email).toHaveAttribute("aria-invalid", "true");
      expect(email).toHaveAccessibleDescription(/\S/);
    });

    await user.clear(email);
    await user.type(email, validPayload.email);

    await waitFor(() => {
      expect(email).toHaveAttribute("aria-invalid", "false");
      expect(email).not.toHaveAttribute("aria-describedby");
    });

    expect(http).not.toHaveBeenCalled();
  });

  it("envía los datos correctos, guarda el usuario y actualiza la sesión", async () => {
    const { user } = setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByLabelText("Usuario de la sesión")).toHaveTextContent(
        validPayload.email,
      );
    });

    expect(http).toHaveBeenCalledTimes(1);

    const request = http.mock.calls[0]![0];

    expect(request.method).toBe("post");
    expect(request.url).toBe("/auth/register");
    expect(JSON.parse(request.data)).toEqual(validPayload);

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(
      JSON.stringify(successfulResponse.user),
    );

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBe(
      successfulResponse.user.id,
    );

    expect(notifications.success).toHaveBeenCalledWith(
      successfulResponse.message,
    );

    expect(getSubmitButton()).toBeEnabled();
  });

  it("impide envíos duplicados con doble clic y clics durante la carga", async () => {
    let finishRequest!: () => void;

    http.mockImplementationOnce(
      (config) =>
        new Promise<AxiosResponse>((resolve) => {
          finishRequest = () => resolve(createResponse(config));
        }),
    );

    const { user } = setup();

    await fillForm(user);

    const button = getSubmitButton();

    await user.dblClick(button);

    await waitFor(() => {
      expect(http).toHaveBeenCalledTimes(1);
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Registrando...");
    });

    for (const field of REGISTER_FIELDS) {
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

    await waitFor(() => {
      expect(button).toBeEnabled();

      expect(screen.getByLabelText("Usuario de la sesión")).toHaveTextContent(
        validPayload.email,
      );
    });

    expect(http).toHaveBeenCalledTimes(1);
    expect(notifications.success).toHaveBeenCalledTimes(1);
  });

  it.each([422, 500])(
    "muestra el mensaje del servidor ante un %s y permite reintentar",
    async (status) => {
      const serverMessage =
        status === 422
          ? "Revisa los datos del formulario"
          : "Ocurrió un error interno";

      http.mockImplementationOnce(async (config) => {
        throw new AxiosError(
          "Solicitud rechazada",
          AxiosError.ERR_BAD_RESPONSE,
          config,
          undefined,
          {
            data: {
              error: {
                code: status === 422 ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
                message: serverMessage,
              },
            },
            status,
            statusText: "Error",
            headers: {},
            config,
          },
        );
      });

      const { user } = setup();

      await fillForm(user);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(notifications.error).toHaveBeenCalledWith(serverMessage);
        expect(getSubmitButton()).toBeEnabled();
      });

      expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBeNull();

      expect(screen.getByLabelText("Usuario de la sesión")).toHaveTextContent(
        "Sin sesión",
      );

      expect(notifications.success).not.toHaveBeenCalled();

      // La siguiente petición usa la respuesta exitosa por defecto.
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByLabelText("Usuario de la sesión")).toHaveTextContent(
          validPayload.email,
        );
      });

      expect(http).toHaveBeenCalledTimes(2);
    },
  );

  it("avisa cuando no hay conexión y vuelve a habilitar el formulario", async () => {
    http.mockImplementationOnce(async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
    });

    const { user } = setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(notifications.error).toHaveBeenCalledTimes(1);
      expect(getSubmitButton()).toBeEnabled();
    });

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBeNull();
    expect(notifications.success).not.toHaveBeenCalled();
  });

  it("recupera la sesión al montar nuevamente la aplicación", async () => {
    const { user, unmount } = setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByLabelText("Usuario de la sesión")).toHaveTextContent(
        validPayload.email,
      );
    });

    unmount();

    // Recreamos React conservando los datos del navegador.
    setup();

    expect(screen.getByLabelText("Usuario de la sesión")).toHaveTextContent(
      validPayload.email,
    );

    expect(http).toHaveBeenCalledTimes(1);
  });

  it("no restaura una sesión que pertenece a otro usuario", () => {
    localStorage.setItem(
      AUTH_STORAGE_KEYS.user,
      JSON.stringify(successfulResponse.user),
    );

    localStorage.setItem(AUTH_STORAGE_KEYS.session, "otro-usuario");

    setup();

    expect(screen.getByLabelText("Usuario de la sesión")).toHaveTextContent(
      "Sin sesión",
    );
  });
});
