export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: {
      field: string | null;
      message: string;
    }[];
  };
}
