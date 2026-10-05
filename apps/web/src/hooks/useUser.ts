import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/services/api";
import { useAuth } from "~/hooks/useAuth";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import type { User } from "~/interfaces/user.interface";
import type {
  RegisterRequest,
  RegisterResponse,
} from "~/interfaces/auth/register.interface";
import type {
  LoginFormValues,
  LoginRequest,
  LoginResponse,
} from "~/interfaces/auth/login.interface";
import { useNavigate } from "react-router";

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { startSession } = useAuth();
  const navigate = useNavigate();

  const register = async (
    values: RegisterRequest,
  ): Promise<RegisterResponse | null> => {
    setIsLoading(true);

    try {
      const { data } = await api.post<RegisterResponse>(
        "/auth/register",
        values,
      );

      if (!startSession(data.user)) return null;

      toast.success(data.message);
      return data;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredUser = (): User | null => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      toast.error("No se pudo leer la cuenta guardada en el navegador.");
      return null;
    }
  };

  const login = async (
    values: LoginFormValues,
  ): Promise<LoginResponse | null> => {
    setIsLoading(true);

    try {
      const user = getStoredUser();

      if (!user) {
        toast.error("Primero registra una cuenta en este navegador.");
        return null;
      }

      const payload: LoginRequest = {
        ...values,
        storedUser: {
          email: user.email,
          passwordHash: user.passwordHash,
          passwordSalt: user.passwordSalt,
        },
      };

      const { data } = await api.post<LoginResponse>("/auth/login", payload);

      if (!startSession(user)) return null;

      toast.success(data.message);
      navigate("/dashboard", { replace: true });

      return data;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, login, isLoading };
};
