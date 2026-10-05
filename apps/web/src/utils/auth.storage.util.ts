import * as yup from "yup";
import type { User } from "~/interfaces/user.interface";

const USER_KEY = "caracoles.user";
const SESSION_KEY = "caracoles.session";

const storedUserSchema: yup.ObjectSchema<User> = yup.object({
  id: yup.string().required(),
  fullName: yup.string().required(),
  email: yup.string().email().required(),
  balance: yup.number().min(0).required(),
  passwordHash: yup
    .string()
    .matches(/^[a-f0-9]{128}$/i)
    .required(),
  passwordSalt: yup
    .string()
    .matches(/^[a-f0-9]{32}$/i)
    .required(),
});

export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    const user: unknown = JSON.parse(storedUser);

    return storedUserSchema.validateSync(user, {
      strict: true,
    });
  } catch {
    return null;
  }
}

export function saveSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
