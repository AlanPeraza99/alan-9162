import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/services/api";
import { useAuth } from "~/hooks/useAuth";
import type {
  RegisterRequest,
  RegisterResponse,
} from "~/interfaces/auth/register.interface";

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { startSession } = useAuth();

  const register = async (
    values: RegisterRequest,
  ): Promise<RegisterResponse | null> => {
    setIsLoading(true);

    try {
      const { data } = await api.post<RegisterResponse>(
        "/auth/register",
        values,
      );

      if (!startSession(data.user)) return null;

      toast.success(data.message);
      return data;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
};
