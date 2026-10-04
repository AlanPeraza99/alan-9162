import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

const options: ScryptOptions = {
  N: 131072,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
};

function calculateHash(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, options, (error, hash) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(hash);
    });
  });
}

export async function hashPassword(
  password: string,
): Promise<{ passwordHash: string; passwordSalt: string }> {
  const passwordSalt = randomBytes(16).toString("hex");
  const hash = await calculateHash(password, passwordSalt);

  return {
    passwordHash: hash.toString("hex"),
    passwordSalt,
  };
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
  passwordSalt: string,
): Promise<boolean> {
  if (
    !/^[a-f0-9]{128}$/i.test(passwordHash) ||
    !/^[a-f0-9]{32}$/i.test(passwordSalt)
  ) {
    return false;
  }

  const hash = await calculateHash(password, passwordSalt);

  return timingSafeEqual(hash, Buffer.from(passwordHash, "hex"));
}
