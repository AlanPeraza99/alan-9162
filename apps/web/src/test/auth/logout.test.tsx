// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Login } from "~/pages/auth/Login";
import { Dashboard } from "~/pages/Dashboard";
import { AuthProvider } from "~/context/AuthContext";
import { GuestRoute } from "~/components/auth/GuestRoute";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import type { User } from "~/interfaces/user.interface";

vi.mock("~/hooks/useApi", () => ({
  useApi: () => ({ status: "connected" }),
}));

const storedUser: User = {
  id: "user-123",
  fullName: "Alan Pérez",
  email: "alan@example.com",
  balance: 150,
  passwordHash: "a".repeat(128),
  passwordSalt: "b".repeat(32),
};

describe("Logout", () => {
  beforeEach(() => {
    localStorage.clear();

    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(storedUser));

    localStorage.setItem(AUTH_STORAGE_KEYS.session, storedUser.id);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("cierra la sesión, vuelve al login y conserva la cuenta y el saldo", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route
              path="/sin-permiso"
              element={<h1>No tienes permiso para acceder</h1>}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(
      await screen.findByRole("heading", {
        name: /inicia sesión/i,
      }),
    ).toBeInTheDocument();

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBeNull();

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(
      JSON.stringify(storedUser),
    );

    expect(
      screen.queryByRole("heading", {
        name: /no tienes permiso/i,
      }),
    ).not.toBeInTheDocument();
  });
});
