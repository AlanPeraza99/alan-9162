import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import roman from "~/assets/img/roman.png";
import { CustomForm } from "~/components/form/CustomForm";
import { useUser } from "~/hooks/useUser";
import { useApi } from "~/hooks/useApi";
import { loginSchema } from "~/schemas/auth/login.schema";
import {
  LOGIN_INITIAL_VALUES,
  LOGIN_FIELDS,
} from "~/constants/auth/login.constants";
import type { LoginFormValues } from "~/interfaces/auth/login.interface";
import { Spinner } from "~/components/spinners/Spinner";

export const Login = () => {
  const { login, isLoading } = useUser();
  const { status } = useApi();
  const navigate = useNavigate();

  if (status !== "connected") {
    <Spinner message="Comprobando conexión con la API..." />;
  }

  useEffect(() => {
    if (status === "error") {
      navigate("/estatus", { replace: true });
    }
  }, [status, navigate]);
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
              Román te espera. Inicia sesión para volver a la carrera.
            </p>
          </header>

          <div className="mx-auto w-full max-w-md rounded-3xl border border-orange-200 bg-orange-50/40 p-6 sm:p-8">
            <h1 className="text-2xl font-black tracking-tight italic">
              INICIA SESIÓN
            </h1>

            <p className="mt-2 mb-7 text-sm text-stone-600">
              Ingresa tu correo y contraseña para continuar.
            </p>

            <CustomForm<LoginFormValues>
              initialValues={LOGIN_INITIAL_VALUES}
              fields={LOGIN_FIELDS}
              validationSchema={loginSchema}
              disabled={isLoading}
              onSubmit={login}
              button={
                <button
                  type="submit"
                  className="min-w-48 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Ingresando..." : "Iniciar sesión"}
                </button>
              }
            />

            <p className="mt-6 text-center text-sm text-stone-600">
              ¿Todavía no tienes cuenta?{" "}
              <Link
                to="/registro"
                className="font-semibold text-orange-700 underline underline-offset-4"
              >
                Regístrate
              </Link>
            </p>

            <div className="mt-4 text-center">
              <Link
                to="/estatus"
                className="text-sm font-semibold text-stone-600 underline decoration-orange-300 underline-offset-4 hover:text-orange-700"
              >
                Ver estado de la API
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
