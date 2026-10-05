import { useState } from "react";
import roman from "~/assets/img/roman.png";
import { Modal } from "~/components/Modal";
import { BetsChart } from "~/components/dashboard/BetsChart";
import { SnailWinsChart } from "~/components/dashboard/SnailWinsChart";
import { PaymentForm } from "~/components/payment/PaymentForm";
import { useAuth } from "~/hooks/useAuth";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-black tracking-tight italic">
            CARRERA DE
            <span className="block text-orange-600">CARACOLES</span>
          </h1>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Cerrar sesión
          </button>
        </header>

        <section className="mt-8 grid items-center gap-6 rounded-3xl border border-orange-200 bg-white p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              ¡Hola, {user.fullName}!
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Consulta tu saldo y los resultados de la jornada. Las apuestas y
              carreras mostradas son simuladas.
            </p>

            <div className="mt-6 rounded-2xl bg-orange-50 p-5">
              <h3 className="text-sm font-semibold text-stone-600">
                Saldo disponible
              </h3>

              <p
                role="status"
                aria-label="Saldo disponible"
                className="mt-2 text-3xl font-black text-orange-600"
              >
                {user.balance.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                })}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPaymentOpen(true)}
              className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              Cargar saldo
            </button>
          </div>

          <img
            src={roman}
            alt="Román con sus motores de carreras"
            className="mx-auto w-full max-w-sm object-contain"
            draggable={false}
          />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <BetsChart />
          <SnailWinsChart />
        </div>
      </div>

      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Cargar saldo"
      >
        <PaymentForm />
      </Modal>
    </main>
  );
};
