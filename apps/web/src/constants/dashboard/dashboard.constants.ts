import type {
  BetStatistic,
  SnailStatistic,
} from "~/interfaces/dashboard/dashboard.interface";

export const BET_STATISTICS: BetStatistic[] = [
  {
    name: "Ganadas",
    quantity: 4,
    fill: "#ea580c",
  },
  {
    name: "Perdidas",
    quantity: 2,
    fill: "#a8a29e",
  },
];

export const SNAIL_STATISTICS: SnailStatistic[] = [
  { id: "roman", name: "Román", wins: 2 },
  { id: "rayo", name: "Rayo", wins: 1 },
  { id: "turbo", name: "Turbo", wins: 1 },
  { id: "luna", name: "Luna", wins: 1 },
  { id: "chispa", name: "Chispa", wins: 1 },
  { id: "tronco", name: "Tronco", wins: 0 },
];

export const TOTAL_RACES = 6;

export const TOTAL_BETS = BET_STATISTICS.reduce(
  (total, statistic) => total + statistic.quantity,
  0,
);
