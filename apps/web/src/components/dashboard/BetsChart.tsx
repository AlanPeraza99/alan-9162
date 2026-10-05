import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  BET_STATISTICS,
  TOTAL_BETS,
} from "~/constants/dashboard/dashboard.constants";

export const BetsChart = () => {
  return (
    <section
      aria-labelledby="bets-title"
      className="min-w-0 rounded-3xl border border-orange-200 bg-white p-6"
    >
      <header>
        <h2
          id="bets-title"
          className="text-xl font-black tracking-tight"
        >
          Tus apuestas
        </h2>

        <p className="mt-1 text-sm text-stone-600">
          Resultados simulados de {TOTAL_BETS} apuestas.
        </p>
      </header>

      <div className="relative mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer>
            <Pie
              data={BET_STATISTICS}
              dataKey="quantity"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={3}
              stroke="#ffffff"
              isAnimationActive={false}
            />

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-3xl font-black text-stone-900">
            {TOTAL_BETS}
          </span>
          <span className="text-xs text-stone-600">apuestas</span>
        </div>
      </div>

      <ul
        aria-label="Resultados de apuestas"
        className="mt-4 grid grid-cols-2 gap-3"
      >
        {BET_STATISTICS.map((statistic) => (
          <li
            key={statistic.name}
            className="rounded-xl bg-stone-50 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: statistic.fill }}
              />

              <span className="text-sm text-stone-600">
                {statistic.name}
              </span>
            </div>

            <p className="mt-1 text-xl font-bold">
              {statistic.quantity}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};