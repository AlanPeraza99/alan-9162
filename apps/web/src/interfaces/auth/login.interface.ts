import type { User } from "~/interfaces/user.interface";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginRequest extends LoginFormValues {
  storedUser: Pick<User, "email" | "passwordHash" | "passwordSalt">;
}

export interface LoginResponse {
  message: string;
}
