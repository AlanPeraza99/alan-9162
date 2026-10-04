import { randomUUID } from "node:crypto";
import type { RegisterRequest } from "../../interfaces/auth/register.interface.js";
import type { User } from "../../interfaces/user.interface.js";
import { registerSchema } from "../../schemas/auth/register.schema.js";
import { hashPassword } from "../../utils/password.util.js";

export async function registerUser(input: RegisterRequest): Promise<User> {
  const data = await registerSchema.validate(input, {
    abortEarly: false,
    stripUnknown: true,
  });

  const { passwordHash, passwordSalt } = await hashPassword(data.password);

  return {
    id: randomUUID(),
    fullName: data.fullName,
    email: data.email,
    balance: 0,
    passwordHash,
    passwordSalt,
  };
}
