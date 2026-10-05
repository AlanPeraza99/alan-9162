// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Login } from "~/pages/auth/Login";
import { Dashboard } from "~/pages/Dashboard";
import { Forbidden } from "~/pages/Forbidden";
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

function saveActiveSession() {
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(storedUser));

  localStorage.setItem(AUTH_STORAGE_KEYS.session, storedUser.id);
}

function setup(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="/sin-permiso" element={<Forbidden />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function expectDashboard() {
  expect(
    screen.getByRole("button", { name: /cerrar sesión/i }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("status", { name: "Saldo disponible" }),
  ).toBeInTheDocument();
}

describe("Rutas de autenticación", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("muestra la vista de permisos al entrar al dashboard sin sesión", async () => {
    setup("/dashboard");

    expect(
      await screen.findByRole("heading", {
        name: /no tienes permiso para acceder/i,
      }),
    ).toBeInTheDocument();
  });

  it.each(["/", "/login"])(
    "redirige desde %s al dashboard cuando ya existe una sesión",
    (path) => {
      saveActiveSession();

      setup(path);

      expectDashboard();
    },
  );

  it("recupera la sesión al montar nuevamente la aplicación", () => {
    saveActiveSession();

    const { unmount } = setup("/dashboard");

    expectDashboard();

    unmount();

    setup("/dashboard");

    expectDashboard();

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(
      JSON.stringify(storedUser),
    );

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.session)).toBe(storedUser.id);
  });

  it("rechaza una sesión cuyo ID no coincide con el usuario guardado", async () => {
    saveActiveSession();

    localStorage.setItem(AUTH_STORAGE_KEYS.session, "otro-usuario");

    setup("/dashboard");

    expect(
      await screen.findByRole("heading", {
        name: /no tienes permiso para acceder/i,
      }),
    ).toBeInTheDocument();
  });
});
