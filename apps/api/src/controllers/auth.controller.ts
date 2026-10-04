import type { NextFunction, Request, Response } from "express";
import type {
  RegisterRequest,
  RegisterResponse,
} from "../interfaces/auth/register.interface";
import { registerUser } from "../services/auth/register.service";

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
