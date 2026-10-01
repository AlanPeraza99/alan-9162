import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Ruta no encontrada",
    },
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;

  res.status(status).json({
    error: {
      code: status === 500 ? "INTERNAL_ERROR" : "INVALID_REQUEST",
      message:
        status === 500
          ? "Ocurrió un error interno"
          : "La solicitud no es válida",
    },
  });
};

app.use(errorHandler);
