import type { ReactNode } from "react";

export interface FormField {
  name: string;
  field: ReactNode;
  error?: string;
}
