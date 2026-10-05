import { Link } from "react-router";
import roman from "~/assets/img/roman.png";
import { CustomForm } from "~/components/form/CustomForm";
import { useUser } from "~/hooks/useUser";
import { registerSchema } from "~/schemas/auth/register.schema";
import {
  REGISTER_INITIAL_VALUES,
  REGISTER_FIELDS,
} from "~/constants/auth/register.constants";
import type { RegisterRequest } from "~/interfaces/auth/register.interface";

export const Register = () => {
  const { register, isLoading } = useUser();

  return (
    <main className="min-h-screen overflow-hidden bg-white text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
        <div className="grid w-full items-center gap-10 md:grid-cols-2">
          <header className="text-center">
            <Link
              to="/"
              className="inline-block rounded-lg focus-visible:outline-2 focus-visible:outline-orange-600"
            >
              <span className="block text-3xl leading-none font-black tracking-tight italic sm:text-4xl">
                CARRERA DE
                <span className="mt-1 block text-orange-600">CARACOLES</span>
              </span>
            </Link>

            <div className="relative isolate mx-auto mt-6 max-w-sm">
              <div
                aria-hidden="true"
                className="absolute inset-x-8 top-1/4 bottom-8 -z-10 rounded-full bg-orange-100/70 blur-3xl"
              />

              <img
                src={roman}
                alt="Román con sus motores de carreras"
                className="block aspect-[3/2] w-full object-contain"
                draggable={false}
              />
            </div>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-600">
              Román ya está listo para la carrera. Crea tu cuenta y entra al
              dashboard.
            </p>
          </header>

          <div className="mx-auto w-full max-w-md rounded-3xl border border-orange-200 bg-orange-50/40 p-6 sm:p-8">
            <h1 className="text-2xl font-black tracking-tight italic">
              CREA TU CUENTA
            </h1>

            <p className="mt-2 mb-7 text-sm text-stone-600">
              Completa tus datos para comenzar.
            </p>

            <CustomForm<RegisterRequest>
              initialValues={REGISTER_INITIAL_VALUES}
              fields={REGISTER_FIELDS}
              validationSchema={registerSchema}
              disabled={isLoading}
              onSubmit={async (values) => {
                await register(values);
              }}
              button={
                <button
                  type="submit"
                  className="min-w-48 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Registrando..." : "Crear cuenta"}
                </button>
              }
            />

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm font-semibold text-stone-600 underline decoration-orange-300 underline-offset-4 hover:text-orange-700"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
