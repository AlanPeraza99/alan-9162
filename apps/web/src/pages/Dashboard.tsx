import { useAuth } from "~/hooks/useAuth";
import roman from "~/assets/img/roman.png";

export const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <main className="min-h-screen bg-white text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10 text-center">
        <h1 className="text-3xl font-black tracking-tight italic">
          CARRERA DE
          <span className="block text-orange-600">CARACOLES</span>
        </h1>

        <img
          src={roman}
          alt="Román con sus motores de carreras"
          className="mt-6 w-full max-w-sm object-contain"
          draggable={false}
        />

        <div
          role="status"
          className="mt-6 w-full rounded-2xl border border-orange-200 bg-orange-50 p-5"
        >
          <h2 className="text-xl font-bold">Sesión iniciada correctamente</h2>

          <p className="mt-2 text-sm text-stone-600">
            ¡Ya estás listo para la carrera!
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  );
};
