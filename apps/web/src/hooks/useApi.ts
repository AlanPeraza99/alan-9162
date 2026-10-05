import { useEffect, useState } from "react";
import { api } from "../services/api";
import { healthSchema } from "~/schemas/api.schema";
import type { ConnectionStatus } from "~/interfaces/api/api";

export const useApi = () => {
  const [status, setStatus] = useState<ConnectionStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function checkConnection() {
      try {
        const response = await api.get("/", {
          signal: controller.signal,
        });

        await healthSchema.validate(response.data, { strict: true });

        if (!controller.signal.aborted) {
          setStatus("connected");
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    }

    void checkConnection();

    return () => controller.abort();
  }, []);

  return { status };
};
