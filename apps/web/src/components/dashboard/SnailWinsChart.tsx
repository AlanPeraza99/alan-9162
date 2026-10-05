import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  SNAIL_STATISTICS,
  TOTAL_RACES,
} from "~/constants/dashboard/dashboard.constants";

export const SnailWinsChart = () => {
  return (
    <section
      aria-labelledby="snails-title"
      className="min-w-0 rounded-3xl border border-orange-200 bg-white p-6"
    >
      <header>
        <h2 id="snails-title" className="text-xl font-black tracking-tight">
          Victorias de los caracoles
        </h2>

        <p className="mt-1 text-sm text-stone-600">
          Seis caracoles en {TOTAL_RACES} carreras de un día simulado.
        </p>
      </header>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={SNAIL_STATISTICS}
            accessibilityLayer
            margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e7e5e4"
            />

            <XAxis
              dataKey="name"
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#57534e" }}
            />

            <YAxis
              allowDecimals={false}
              domain={[0, TOTAL_RACES]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#57534e" }}
            />

            <Tooltip cursor={{ fill: "#fff7ed" }} />

            <Bar
              dataKey="wins"
              name="Victorias"
              fill="#ea580c"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-orange-700">
          Ver resultados en tabla
        </summary>

        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">Victorias de los seis caracoles</caption>

          <thead>
            <tr className="border-b border-stone-200">
              <th scope="col" className="py-2 font-semibold">
                Caracol
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Victorias
              </th>
            </tr>
          </thead>

          <tbody>
            {SNAIL_STATISTICS.map((snail) => (
              <tr key={snail.id} className="border-b border-stone-100">
                <th scope="row" className="py-2 font-normal">
                  {snail.name}
                </th>
                <td className="py-2 text-right">{snail.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
};
