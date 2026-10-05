import axios from "axios";
import { toast } from "sonner";
import type { ApiErrorResponse } from "~/interfaces/api/api-error.interface";

export function handleApiError(error: unknown): void {
  if (axios.isCancel(error)) return;

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    toast.error("Ocurrió un error inesperado.");
    return;
  }

  const data = error.response?.data;
  const message = data?.error?.message ?? data?.message;

  if (typeof message === "string" && message.trim()) {
    toast.error(message);
    return;
  }

  const isTimeout = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";

  if (isTimeout) {
    toast.error("El servidor tardó demasiado en responder.");
    return;
  }

  if (!error.response) {
    toast.error("No se pudo conectar con el servidor.");
    return;
  }

  toast.error("No se pudo completar la solicitud.");
}
