import { PaymentForm } from "~/components/payment/PaymentForm";
import { useAuth } from "~/hooks/useAuth";

export const Dashboard = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <main className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-black tracking-tight italic">
            CARRERA DE
            <span className="block text-orange-600">CARACOLES</span>
          </h1>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Cerrar sesión
          </button>
        </header>

        <div className="mt-10 grid items-start gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-orange-200 bg-orange-50/40 p-6 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight">
              ¡Hola, {user.fullName}!
            </h2>

            <p className="mt-2 text-sm text-stone-600">
              Bienvenido a tu dashboard.
            </p>

            <div className="mt-6 rounded-2xl border border-orange-200 bg-white p-5">
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
          </section>

          <PaymentForm />
        </div>
      </div>
    </main>
  );
};
