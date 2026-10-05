import { createCipheriv, randomBytes } from "node:crypto";
import { env } from "../config/env.js";

export function encryptValue(value: string): string {
  const key = Buffer.from(env.SNAILPAY_ENCRYPTION_KEY, "hex");
  const iv = randomBytes(12);

  const cipher = createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: 16,
  });

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return [
    "v1",
    iv.toString("hex"),
    cipher.getAuthTag().toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}
