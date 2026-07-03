import { useAuth } from '../auth/AuthContext';

// Stub temporal para las pantallas que construyen Persona 2 y 3.
// Sirve para probar la base (login + rutas por rol). REEMPLAZAR.
export default function Placeholder({ title, owner }: { title: string; owner: string }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Sesión activa</p>
            <p className="font-semibold text-gray-900">
              {user?.firstName} {user?.lastName} · {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Pantalla pendiente — la construye <span className="font-medium">{owner}</span>.
        </p>
      </div>
    </div>
  );
}
