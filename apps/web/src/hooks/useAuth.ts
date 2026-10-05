import { useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "~/context/AuthContext";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import type { User } from "~/interfaces/user.interface";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  const { user, setUser } = context;

  const startSession = (user: User): boolean => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
      localStorage.setItem(AUTH_STORAGE_KEYS.session, user.id);
      setUser(user);
      return true;
    } catch {
      toast.error("No se pudo guardar la sesión en el navegador.");
      return false;
    }
  };

  const updateUser = (user: User): boolean => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
      setUser(user);
      return true;
    } catch {
      toast.error("No se pudieron guardar los datos del usuario.");
      return false;
    }
  };

  const logout = (): void => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.session);
      setUser(null);
    } catch {
      toast.error("No se pudo cerrar la sesión en el navegador.");
    }
  };

  return { user, startSession, updateUser, logout };
};
