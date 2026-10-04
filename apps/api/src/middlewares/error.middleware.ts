import type { ErrorRequestHandler } from "express";
import { ValidationError } from "yup";

function isClientError(error: unknown): error is { status: number } {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }

  return (
    typeof error.status === "number" &&
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
  );
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ValidationError) {
    const issues = error.inner.length ? error.inner : [error];

    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Revisa los datos del formulario",
        details: issues.map((issue) => ({
          field: issue.path ?? null,
          message: issue.message,
        })),
      },
    });

    return;
  }

  if (isClientError(error)) {
    const tooLarge = error.status === 413;

    res.status(error.status).json({
      error: {
        code: tooLarge ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST",
        message: tooLarge
          ? "La solicitud supera el tamaño permitido"
          : "La solicitud no es válida",
      },
    });

    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocurrió un error interno",
    },
  });
};
