import { motion, useReducedMotion } from "motion/react";
import { useApi } from "~/hooks/useApi";
import roman from "~/assets/img/roman.png";
import roman_x from "~/assets/img/roman_x.png";
import {
  messages,
  speedLines,
  statusStyles,
} from "~/utils/api-health-responses";

export function Home() {
  const { status } = useApi();
  const reduceMotion = useReducedMotion();

  const isDown = status === "error";
  const isRacing = status === "connected" && !reduceMotion;

  return (
    <main className="min-h-screen overflow-hidden bg-white text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-8">
        <div className="relative isolate mx-auto w-full max-w-lg">
          <div
            aria-hidden="true"
            className={`absolute inset-x-8 top-1/4 bottom-8 -z-10 rounded-full blur-3xl ${
              isDown ? "bg-red-100/70" : "bg-orange-100/70"
            }`}
          />

          {isRacing && (
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden"
            >
              {speedLines.map((line, index) => (
                <motion.div
                  key={index}
                  className="absolute left-0 h-1 rounded-full bg-linear-to-r from-transparent via-orange-400 to-amber-300"
                  style={{
                    top: line.top,
                    width: line.width,
                  }}
                  animate={{
                    x: ["32rem", "-24rem"],
                    opacity: [0, 0.65, 0.65, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: line.delay,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            key={isRacing ? "racing" : "stopped"}
            className="relative z-20 mx-auto w-full max-w-sm"
            animate={isRacing ? { x: [-6, 8, -6] } : { x: 0 }}
            transition={
              isRacing
                ? {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : { duration: 0 }
            }
          >
            <motion.img
              src={isDown ? roman_x : roman}
              alt={
                isDown
                  ? "Román caído con ojos en forma de X"
                  : "Román con sus motores de carreras"
              }
              className="block aspect-[3/2] w-full origin-[65%_80%] object-contain"
              draggable={false}
              animate={
                isRacing
                  ? {
                      y: [0, -3, 0, -1, 0],
                      rotate: [-0.4, 0.2, -0.4],
                    }
                  : { y: 0, rotate: 0 }
              }
              transition={
                isRacing
                  ? {
                      duration: 0.3,
                      repeat: Infinity,
                      ease: "linear",
                    }
                  : { duration: 0 }
              }
            />
          </motion.div>

          <div
            aria-hidden="true"
            className={`relative z-0 -mt-6 h-8 overflow-hidden border-y ${
              isDown
                ? "border-stone-200 bg-stone-100"
                : "border-orange-200 bg-orange-50"
            }`}
            style={{
              clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)",
            }}
          >
            <motion.div
              key={isRacing ? "moving" : "static"}
              className="absolute inset-y-0 -left-24 right-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  ${isDown ? "#a8a29e" : "#fb923c"} 0 48px,
                  transparent 48px 96px
                )`,
                backgroundSize: "96px 4px",
                backgroundPosition: "left center",
                backgroundRepeat: "repeat-x",
              }}
              animate={isRacing ? { x: [0, -96] } : { x: 0 }}
              transition={
                isRacing
                  ? {
                      duration: 0.22,
                      repeat: Infinity,
                      ease: "linear",
                    }
                  : { duration: 0 }
              }
            />
          </div>
        </div>

        <header className="relative z-30 mt-5 text-center">
          <h1 className="mt-3 text-3xl leading-none font-black tracking-tight italic sm:text-4xl">
            CARRERA DE
            <span className="mt-1 block text-orange-600">CARACOLES</span>
          </h1>
        </header>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`mx-auto mt-5 flex w-full max-w-sm items-center gap-3 rounded-2xl border p-4 ${statusStyles[status]}`}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 font-bold"
          >
            {status === "connected" ? "✓" : status === "loading" ? "…" : "!"}
          </span>

          <div>
            <p className="text-xs font-bold">{messages[status]}</p>

            {isDown && (
              <p className="mt-1 text-xs">
                No se pudo verificar la API. Volveremos a intentarlo
                automáticamente.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
