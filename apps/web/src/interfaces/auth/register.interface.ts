import type { User } from "~/interfaces/user.interface";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
export type RegisterFieldErrors = Partial<
  Record<keyof RegisterRequest, string>
>;
