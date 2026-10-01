import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import david from "~/assets/img/david_o.png";

export function NotFound() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10 text-stone-900">
      <section className="w-full max-w-lg text-center">
        <div className="relative isolate mx-auto max-w-xs">
          <div
            aria-hidden="true"
            className="absolute inset-10 -z-10 rounded-full bg-purple-100 blur-3xl"
          />

          <motion.img
            src={david}
            alt="David, un pequeño caracol morado, mira sorprendido"
            className="block h-auto w-full"
            draggable={false}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <h1 className="mt-3">
          <span className="block text-7xl font-black tracking-tight text-orange-600">
            404
          </span>

          <span className="mt-3 block text-2xl font-bold sm:text-3xl">
            Página no encontrada
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
          La página que buscas no existe, pero podemos volver juntos a la pista.
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex items-center justify-center rounded-xl bg-orange-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
