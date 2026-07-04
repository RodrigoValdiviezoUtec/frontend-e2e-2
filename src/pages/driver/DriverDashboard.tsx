import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import { getPendingTrips, getMyTripsDriver, acceptTrip, completeTrip } from '../../api/trips';
import type { Trip } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const POLL_MS = 5000;

const ERROR_TRANSLATIONS: Record<string, string> = {
  'Trip is not available for acceptance': 'Ese viaje ya no está disponible para aceptar.',
  'Driver is not available': 'No puedes aceptar otro viaje mientras tengas uno en curso.',
  'Trip is not in progress': 'Ese viaje ya no está en curso.',
};

function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(err)) {
    const raw = (err.response?.data as { error?: string } | undefined)?.error;
    if (raw) return ERROR_TRANSLATIONS[raw] ?? raw;
  }
  return fallback;
}

export default function DriverDashboard() {
  const { user } = useAuth();

  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

  const loadData = useCallback(async (isFirstLoad: boolean) => {
    try {
      const [pending, mine] = await Promise.all([getPendingTrips(), getMyTripsDriver()]);
      setPendingTrips(pending);
      setActiveTrip(mine.find((t) => t.status === 'IN_PROGRESS') ?? null);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar tus viajes.'));
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), POLL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  async function handleAccept(id: number) {
    setAcceptingId(id);
    setError(null);
    try {
      await acceptTrip(id);
      await loadData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo aceptar el viaje.'));
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleComplete(id: number) {
    setCompleting(true);
    setError(null);
    try {
      await completeTrip(id);
      await loadData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo completar el viaje.'));
    } finally {
      setCompleting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Hola, {user?.firstName}</h1>
            <p className="text-sm text-slate-500">
              ★ {user?.rating.toFixed(1) ?? '—'} de rating
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/history" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Historial
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Viaje activo
          </h2>
          {activeTrip ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <StatusBadge status={activeTrip.status} />
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-medium">Desde:</span> {activeTrip.pickupAddress}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Hasta:</span> {activeTrip.dropoffAddress}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Pasajero: {activeTrip.passenger.firstName} {activeTrip.passenger.lastName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    to={`/driver/trips/${activeTrip.id}`}
                    className="text-sm font-medium text-slate-600 hover:underline"
                  >
                    Ver detalle
                  </Link>
                  <button
                    onClick={() => handleComplete(activeTrip.id)}
                    disabled={completing}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    {completing ? 'Completando…' : 'Completar viaje'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No tienes ningún viaje en curso. Acepta un viaje pendiente para empezar.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Viajes pendientes
          </h2>
          {pendingTrips.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay viajes pendientes por ahora. Vuelve a revisar en un momento.
            </p>
          ) : (
            <ul className="space-y-3">
              {pendingTrips.map((trip) => (
                <li
                  key={trip.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Desde:</span> {trip.pickupAddress}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Hasta:</span> {trip.dropoffAddress}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Pasajero: {trip.passenger.firstName} {trip.passenger.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAccept(trip.id)}
                    disabled={Boolean(activeTrip) || acceptingId === trip.id}
                    title={activeTrip ? 'Ya tienes un viaje en curso' : undefined}
                    className="shrink-0 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
                  >
                    {acceptingId === trip.id ? 'Aceptando…' : 'Aceptar'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}