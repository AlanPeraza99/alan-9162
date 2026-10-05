import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import roman_x from "~/assets/img/roman_x.png";

export const Forbidden = () => {
  const [seconds, setSeconds] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (seconds === 0) {
      navigate("/", { replace: true });
      return;
    }

    const timer = window.setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [seconds, navigate]);

  return (
    <main className="min-h-screen bg-white text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10 text-center">
        <h1 className="text-3xl font-black tracking-tight italic">
          CARRERA DE
          <span className="block text-orange-600">CARACOLES</span>
        </h1>

        <img
          src={roman_x}
          alt="Román caído con ojos en forma de X"
          className="mt-6 w-full max-w-sm object-contain"
          draggable={false}
        />

        <p className="mt-4 text-sm font-bold text-orange-600">403</p>

        <h2 className="mt-2 text-2xl font-black">
          No tienes permiso para acceder
        </h2>

        <p className="mt-3 text-sm text-stone-600">
          No cuentas con los permisos necesarios para ver esta página.
        </p>

        <p role="status" className="mt-4 text-sm text-stone-600">
          Volverás a la pantalla de inicio en{" "}
          <span className="font-bold text-orange-600">{seconds}</span>{" "}
          {seconds === 1 ? "segundo" : "segundos"}.
        </p>

        <Link
          to="/"
          replace
          className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
};
