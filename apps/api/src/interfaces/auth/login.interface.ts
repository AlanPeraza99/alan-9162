import type { User } from "../user.interface.js";

export interface LoginRequest {
  email: string;
  password: string;
  storedUser: Pick<User, "email" | "passwordHash" | "passwordSalt">;
}

export interface LoginResponse {
  message: string;
}
