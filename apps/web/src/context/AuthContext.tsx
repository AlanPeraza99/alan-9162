import {
  createContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AUTH_STORAGE_KEYS } from "~/constants/auth/auth-storage.constants";
import type { User } from "~/interfaces/user.interface";

interface AuthContextValue {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function getActiveUser(): User | null {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    const session = localStorage.getItem(AUTH_STORAGE_KEYS.session);

    if (!storedUser || !session) return null;

    const user: User = JSON.parse(storedUser);

    return user.id === session ? user : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getActiveUser);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
