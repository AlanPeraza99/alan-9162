import type { NextFunction, Request, Response } from "express";
import type {
  RegisterRequest,
  RegisterResponse,
} from "../interfaces/auth/register.interface";
import { registerUser } from "../services/auth/register.service";
import type {
  LoginRequest,
  LoginResponse,
} from "../interfaces/auth/login.interface.js";
import { loginUser } from "../services/auth/login.service.js";

export async function register(
  req: Request<Record<string, never>, RegisterResponse, RegisterRequest>,
  res: Response<RegisterResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message: "Te has registrado exitosamente",
      user,
    });
  } catch (error) {
    next(error);
  }
}
export async function login(
  req: Request<Record<string, never>, LoginResponse, LoginRequest>,
  res: Response<LoginResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    await loginUser(req.body);

    res.status(200).json({
      message: "Inicio de sesión correcto",
    });
  } catch (error) {
    next(error);
  }
}
