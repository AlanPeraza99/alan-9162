import axios from "axios";
import { toast } from "sonner";
import type { ApiErrorResponse } from "~/interfaces/api/api-error.interface";

export function handleApiError(error: unknown): void {
  if (axios.isCancel(error)) {
    return;
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    toast.error("Ocurrió un error inesperado.");
    return;
  }

  const serverMessage = error.response?.data?.error?.message;

  if (typeof serverMessage === "string" && serverMessage.trim().length > 0) {
    toast.error(serverMessage);
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
