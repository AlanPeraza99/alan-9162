import axios from "axios";
import { handleApiError } from "~/services/api-error.service";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    handleApiError(error);

    return Promise.reject(error);
  },
);
