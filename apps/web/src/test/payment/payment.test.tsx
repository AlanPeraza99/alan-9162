// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Dashboard } from "~/pages/Dashboard";
import { AuthProvider } from "~/context/AuthContext";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import {
  PAYMENT_FIELDS,
  PAYMENT_STORAGE_KEY,
} from "~/constants/payment/payment.constants";
import { api } from "~/services/api";
import type { User } from "~/interfaces/user.interface";
import type {
  PaymentFormValues,
  PaymentResponse,
} from "~/interfaces/payment/payment.interface";

const notifications = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: notifications,
}));

// Las gráficas se prueban por separado.
vi.mock("~/components/dashboard/BetsChart", () => ({
  BetsChart: () => null,
}));

vi.mock("~/components/dashboard/SnailWinsChart", () => ({
  SnailWinsChart: () => null,
}));

const storedUser: User = {
  id: "user-123",
  fullName: "Alan Pérez",
  email: "alan@example.com",
  balance: 50,
  passwordHash: "a".repeat(128),
  passwordSalt: "b".repeat(32),
};

const validValues: PaymentFormValues = {
  cardNumber: "1234123412341234",
  expirationDate: "12/26",
  cvv: "543",
  fullName: "Alan Pérez",
  amount: "100",
};

const approvedPayment: PaymentResponse = {
  id: "payment-123",
  status: "approved",
  status_detail: "accredited",
  transaction_amount: 100,
  date_created: "2026-10-05T01:00:00.000Z",
  authorization_code: "authorization-123",
  reference: "SNAIL-payment-123",
  payer_id: storedUser.id,
  payer_email: storedUser.email,
  card_number: validValues.cardNumber,
  cvv: validValues.cvv,
  message: "Recarga aprobada correctamente",
};

const http = vi.fn<AxiosAdapter>();
const originalAdapter = api.defaults.adapter;

const dialogPrototype = HTMLDialogElement.prototype;

const originalShowModal = Object.getOwnPropertyDescriptor(
  dialogPrototype,
  "showModal",
);

const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, "close");

function createResponse(
  config: InternalAxiosRequestConfig,
  data: PaymentResponse = approvedPayment,
): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
}

function renderDashboard() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </MemoryRouter>,
  );

  return userEvent.setup();
}

async function setup() {
  const user = renderDashboard();

  await user.click(screen.getByRole("button", { name: "Cargar saldo" }));

  await screen.findByRole("dialog", { name: "Cargar saldo" });

  return user;
}

function getModal() {
  return screen.getByRole("dialog", { name: "Cargar saldo" });
}

function getSubmitButton() {
  return within(getModal()).getByRole("button", {
    name: /cargar saldo|procesando/i,
  });
}

function getField(name: keyof PaymentFormValues) {
  const field = PAYMENT_FIELDS.find((field) => field.name === name);

  if (!field) {
    throw new Error(`No existe el campo ${name}`);
  }

  return within(getModal()).getByLabelText(field.label);
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values: PaymentFormValues = validValues,
) {
  for (const field of PAYMENT_FIELDS) {
    await user.clear(getField(field.name));
    await user.type(getField(field.name), values[field.name]);
  }
}

function getBalance(): number {
  const user: User = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.user)!);

  return user.balance;
}

function expectVisibleBalance(amount: number) {
  expect(
    screen.getByRole("status", { name: "Saldo disponible" }),
  ).toHaveTextContent(
    amount.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    }),
  );
}

describe("Modal de recarga", () => {
  beforeAll(() => {
    Object.defineProperty(dialogPrototype, "showModal", {
      configurable: true,
      writable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });

    Object.defineProperty(dialogPrototype, "close", {
      configurable: true,
      writable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute("open");
      },
    });
  });

  afterAll(() => {
    if (originalShowModal) {
      Object.defineProperty(dialogPrototype, "showModal", originalShowModal);
    } else {
      Reflect.deleteProperty(dialogPrototype, "showModal");
    }

    if (originalClose) {
      Object.defineProperty(dialogPrototype, "close", originalClose);
    } else {
      Reflect.deleteProperty(dialogPrototype, "close");
    }
  });

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();

    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(storedUser));

    localStorage.setItem(AUTH_STORAGE_KEYS.session, storedUser.id);

    api.defaults.adapter = http;
    http.mockImplementation(async (config) => createResponse(config));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    api.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it("abre y cierra el modal sin procesar una recarga", async () => {
    const user = renderDashboard();

    expect(
      screen.queryByRole("dialog", { name: "Cargar saldo" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cargar saldo" }));

    const modal = await screen.findByRole("dialog", {
      name: "Cargar saldo",
    });

    expect(
      within(modal).getByLabelText("Monto de la recarga"),
    ).toBeInTheDocument();

    await user.click(
      within(modal).getByRole("button", { name: "Cerrar modal" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Cargar saldo" }),
      ).not.toBeInTheDocument();
    });

    expect(http).not.toHaveBeenCalled();
    expect(getBalance()).toBe(50);
  });

  it("no envía una recarga con monto cero", async () => {
    const user = await setup();

    await fillForm(user, {
      ...validValues,
      amount: "0",
    });

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(getField("amount")).toHaveAttribute("aria-invalid", "true");

      expect(getField("amount")).toHaveAccessibleDescription(/\S/);
    });

    expect(http).not.toHaveBeenCalled();
    expect(getBalance()).toBe(50);
  });

  it("envía los datos correctos, actualiza el saldo y guarda la operación", async () => {
    const user = await setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expectVisibleBalance(150);
      expect(getSubmitButton()).toBeEnabled();
    });

    expect(getBalance()).toBe(150);
    expect(http).toHaveBeenCalledTimes(1);

    const request = http.mock.calls[0]![0];

    expect(request.method).toBe("post");
    expect(request.url).toBe("/snailpay/payments");

    expect(JSON.parse(request.data)).toEqual({
      ...validValues,
      amount: 100,
      payerId: storedUser.id,
      payerEmail: storedUser.email,
    });

    expect(localStorage.getItem(PAYMENT_STORAGE_KEY)).toBe(
      JSON.stringify(approvedPayment),
    );

    expect(notifications.success).toHaveBeenCalledWith(approvedPayment.message);
  });

  it("conserva el saldo cuando la tarjeta es rechazada", async () => {
    const rejectedPayment: PaymentResponse = {
      ...approvedPayment,
      status: "rejected",
      status_detail: "card_declined",
      authorization_code: null,
      card_number: "4000000000000002",
      message: "La tarjeta de prueba fue rechazada",
    };

    http.mockImplementationOnce(async (config) =>
      createResponse(config, rejectedPayment),
    );

    const user = await setup();

    await fillForm(user, {
      ...validValues,
      cardNumber: rejectedPayment.card_number,
    });

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(notifications.error).toHaveBeenCalledWith(rejectedPayment.message);

      expect(getSubmitButton()).toBeEnabled();
    });

    expect(getBalance()).toBe(50);
    expectVisibleBalance(50);

    expect(localStorage.getItem(PAYMENT_STORAGE_KEY)).toBe(
      JSON.stringify(rejectedPayment),
    );

    expect(notifications.success).not.toHaveBeenCalled();
  });

  it("conserva el saldo y guarda la respuesta del fallo simulado", async () => {
    const failedPayment: PaymentResponse = {
      ...approvedPayment,
      status: "error",
      status_detail: "system_error",
      authorization_code: null,
      card_number: "5000000000000000",
      message: "SnailPay no está disponible. Intenta nuevamente",
    };

    http.mockImplementationOnce(async (config) => {
      throw new AxiosError(
        "SnailPay no disponible",
        AxiosError.ERR_BAD_RESPONSE,
        config,
        undefined,
        {
          data: failedPayment,
          status: 503,
          statusText: "Service Unavailable",
          headers: {},
          config,
        },
      );
    });

    const user = await setup();

    await fillForm(user, {
      ...validValues,
      cardNumber: failedPayment.card_number,
    });

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(localStorage.getItem(PAYMENT_STORAGE_KEY)).toBe(
        JSON.stringify(failedPayment),
      );

      expect(getSubmitButton()).toBeEnabled();
    });

    expect(notifications.error).toHaveBeenCalledWith(failedPayment.message);

    expect(getBalance()).toBe(50);
    expectVisibleBalance(50);
    expect(notifications.success).not.toHaveBeenCalled();
  });

  it("no modifica el saldo cuando falla la conexión", async () => {
    http.mockImplementationOnce(async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
    });

    const user = await setup();

    await fillForm(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(notifications.error).toHaveBeenCalledTimes(1);
      expect(getSubmitButton()).toBeEnabled();
    });

    expect(getBalance()).toBe(50);
    expect(localStorage.getItem(PAYMENT_STORAGE_KEY)).toBeNull();
    expect(notifications.success).not.toHaveBeenCalled();
  });

  it("realiza una sola petición ante clics repetidos durante la carga", async () => {
    let finishRequest!: () => void;

    http.mockImplementationOnce(
      (config) =>
        new Promise<AxiosResponse>((resolve) => {
          finishRequest = () => resolve(createResponse(config));
        }),
    );

    const user = await setup();

    await fillForm(user);

    const button = getSubmitButton();

    await user.dblClick(button);

    await waitFor(() => {
      expect(http).toHaveBeenCalledTimes(1);
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Procesando...");
    });

    for (const field of PAYMENT_FIELDS) {
      expect(getField(field.name)).toBeDisabled();
    }

    await user.click(button);
    await user.click(button);

    expect(http).toHaveBeenCalledTimes(1);
    expect(getBalance()).toBe(50);

    await act(async () => {
      finishRequest();
    });

    await waitFor(() => {
      expectVisibleBalance(150);
      expect(button).toBeEnabled();
    });

    expect(getBalance()).toBe(150);
    expect(http).toHaveBeenCalledTimes(1);
  });
});
