// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cloneElement, type ReactElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Dashboard } from "~/pages/Dashboard";
import { AuthProvider } from "~/context/AuthContext";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import {
  BET_STATISTICS,
  SNAIL_STATISTICS,
  TOTAL_BETS,
  TOTAL_RACES,
} from "~/constants/dashboard/dashboard.constants";
import type { User } from "~/interfaces/user.interface";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();

  return {
    ...actual,
    ResponsiveContainer: ({
      children,
    }: {
      children: ReactElement<{
        width?: number;
        height?: number;
      }>;
    }) => cloneElement(children, { width: 600, height: 256 }),
  };
});

const storedUser: User = {
  id: "user-123",
  fullName: "Alan Pérez",
  email: "alan@example.com",
  balance: 150.5,
  passwordHash: "a".repeat(128),
  passwordSalt: "b".repeat(32),
};

function setup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </MemoryRouter>,
  );
}

function expectBalance(amount: number) {
  expect(
    screen.getByRole("status", { name: "Saldo disponible" }),
  ).toHaveTextContent(
    amount.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    }),
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    localStorage.clear();

    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(storedUser));

    localStorage.setItem(AUTH_STORAGE_KEYS.session, storedUser.id);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("muestra el nombre y el saldo del usuario", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        name: `¡Hola, ${storedUser.fullName}!`,
      }),
    ).toBeInTheDocument();

    expectBalance(storedUser.balance);
  });

  it("muestra las opciones para cargar saldo y cerrar sesión", () => {
    setup();

    expect(screen.getByRole("button", { name: "Cargar saldo" })).toBeEnabled();

    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeEnabled();
  });

  it("muestra las cantidades de apuestas ganadas y perdidas", () => {
    setup();

    const results = screen.getByRole("list", {
      name: "Resultados de apuestas",
    });

    const items = within(results).getAllByRole("listitem");

    expect(items).toHaveLength(2);

    for (const statistic of BET_STATISTICS) {
      const item = items.find((item) =>
        within(item).queryByText(statistic.name),
      );

      expect(item).toBeDefined();

      expect(
        within(item!).getByText(String(statistic.quantity)),
      ).toBeInTheDocument();
    }
  });

  it("utiliza cantidades válidas para las apuestas simuladas", () => {
    expect(BET_STATISTICS.map((statistic) => statistic.name)).toEqual([
      "Ganadas",
      "Perdidas",
    ]);

    for (const statistic of BET_STATISTICS) {
      expect(Number.isInteger(statistic.quantity)).toBe(true);
      expect(statistic.quantity).toBeGreaterThanOrEqual(0);
    }

    const total = BET_STATISTICS.reduce(
      (sum, statistic) => sum + statistic.quantity,
      0,
    );

    expect(total).toBeGreaterThan(0);
    expect(TOTAL_BETS).toBe(total);
  });

  it("representa seis caracoles con seis victorias en total", () => {
    expect(TOTAL_RACES).toBe(6);
    expect(SNAIL_STATISTICS).toHaveLength(6);

    const ids = SNAIL_STATISTICS.map((snail) => snail.id);
    const names = SNAIL_STATISTICS.map((snail) => snail.name);

    expect(new Set(ids).size).toBe(6);
    expect(new Set(names).size).toBe(6);

    for (const snail of SNAIL_STATISTICS) {
      expect(snail.name.trim()).not.toBe("");
      expect(Number.isInteger(snail.wins)).toBe(true);
      expect(snail.wins).toBeGreaterThanOrEqual(0);
    }

    const totalWins = SNAIL_STATISTICS.reduce(
      (sum, snail) => sum + snail.wins,
      0,
    );

    expect(totalWins).toBe(6);
  });

  it("permite consultar las victorias en una tabla", async () => {
    const user = userEvent.setup();

    setup();

    await user.click(screen.getByText("Ver resultados en tabla"));

    const table = screen.getByRole("table", {
      name: "Victorias de los seis caracoles",
    });

    expect(within(table).getAllByRole("row")).toHaveLength(7);

    for (const snail of SNAIL_STATISTICS) {
      const heading = within(table).getByRole("rowheader", {
        name: snail.name,
      });

      const row = heading.closest("tr");

      expect(row).not.toBeNull();

      expect(
        within(row!).getByRole("cell", {
          name: String(snail.wins),
        }),
      ).toBeInTheDocument();
    }
  });

  it("recupera el saldo guardado al montar nuevamente la aplicación", () => {
    const { unmount } = setup();

    expectBalance(150.5);

    unmount();

    const updatedUser: User = {
      ...storedUser,
      balance: 250.5,
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(updatedUser));

    setup();

    expectBalance(250.5);
  });
});
