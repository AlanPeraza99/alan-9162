export interface ApiErrorResponse {
  message?: string;
  error: {
    code: string;
    message: string;
    details?: {
      field: string | null;
      message: string;
    }[];
  };
}
