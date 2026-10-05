import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const envPath = new URL("../.env", import.meta.url);
const variable = "SNAILPAY_ENCRYPTION_KEY";

let content = "";

try {
  content = await readFile(envPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const variablePattern =
  /^[ \t]*(?:export[ \t]+)?SNAILPAY_ENCRYPTION_KEY[ \t]*=.*$/gm;

const existingLines = content.match(variablePattern) ?? [];

if (existingLines.length > 1) {
  throw new Error(
    "Hay varias definiciones de SNAILPAY_ENCRYPTION_KEY. Conserva solo una.",
  );
}

if (existingLines.length === 1) {
  const value = existingLines[0]
    .slice(existingLines[0].indexOf("=") + 1)
    .trim();

  const validKey = /^(?:[a-f0-9]{64}|"[a-f0-9]{64}"|'[a-f0-9]{64}')$/i.test(
    value,
  );

  if (validKey) {
    console.log("La clave ya existe. No se modificó.");
    process.exit(0);
  }

  if (value !== "" && value !== '""' && value !== "''") {
    throw new Error(
      "La variable contiene un valor inválido. Déjala vacía para generar la clave.",
    );
  }
}

const key = randomBytes(32).toString("hex");
const line = `${variable}=${key}`;
const newline = content.includes("\r\n") ? "\r\n" : "\n";

if (existingLines.length === 1) {
  content = content.replace(variablePattern, () => line);
} else {
  if (content && !content.endsWith("\n")) {
    content += newline;
  }

  content += line + newline;
}

await writeFile(envPath, content, {
  encoding: "utf8",
  mode: 0o600,
});

console.log("Clave generada y guardada en apps/api/.env.");
