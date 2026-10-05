import type { LoginRequest } from "../../interfaces/auth/login.interface.js";
import { loginSchema } from "../../schemas/auth/login.schema.js";
import { verifyPassword } from "../../utils/password.util.js";

export async function loginUser(input: LoginRequest): Promise<void> {
  const data = await loginSchema.validate(input, {
    abortEarly: false,
    stripUnknown: true,
  });

  const validPassword = await verifyPassword(
    data.password,
    data.storedUser.passwordHash,
    data.storedUser.passwordSalt,
  );

  const validEmail = data.email === data.storedUser.email;

  if (!validEmail || !validPassword) {
    throw Object.assign(new Error("Correo o contraseña incorrectos"), {
      status: 401,
    });
  }
}
