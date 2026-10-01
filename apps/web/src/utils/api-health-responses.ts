import type { ConnectionStatus } from "~/interfaces/api";

export const messages: Record<ConnectionStatus, string> = {
  loading: "COMPROBANDO API…",
  connected: "API EN FUNCIONAMIENTO",
  error: "SERVIDOR CAÍDO",
};

export const statusStyles: Record<ConnectionStatus, string> = {
  loading: "border-amber-200 bg-amber-50 text-amber-800",
  connected: "border-orange-200 bg-orange-50 text-orange-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

export const speedLines: { top: string; width: string; delay: number }[] = [
  { top: "16%", width: "38%", delay: 0 },
  { top: "30%", width: "25%", delay: 0.3 },
  { top: "49%", width: "45%", delay: 0.15 },
  { top: "68%", width: "30%", delay: 0.45 },
  { top: "82%", width: "40%", delay: 0.1 },
];
