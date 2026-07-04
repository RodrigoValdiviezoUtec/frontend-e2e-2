import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getTrip, completeTrip } from '../../api/trips';
import type { Trip } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const ERROR_TRANSLATIONS: Record<string, string> = {
  'Trip is not in progress': 'Ese viaje ya no está en curso.',
};

function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(err)) {
    const raw = (err.response?.data as { error?: string } | undefined)?.error;
    if (raw) return ERROR_TRANSLATIONS[raw] ?? raw;
  }
  return fallback;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function DriverTripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getTrip(Number(id));
      setTrip(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar el viaje.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleComplete() {
    if (!trip) return;
    setCompleting(true);
    setError(null);
    try {
      const updated = await completeTrip(trip.id);
      setTrip(updated);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo completar el viaje.'));
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando…
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-red-600">{error ?? 'No se encontró el viaje.'}</p>
        <button
          onClick={() => navigate('/driver')}
          className="text-sm font-medium text-slate-600 hover:underline"
        >
          Volver al dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/driver" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Volver
          </Link>
          <StatusBadge status={trip.status} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Viaje <span className="font-mono text-slate-400">#{trip.id}</span>
          </h1>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Origen</dt>
              <dd className="text-slate-800">{trip.pickupAddress}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Destino</dt>
              <dd className="text-slate-800">{trip.dropoffAddress}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Pasajero</dt>
              <dd className="text-slate-800">
                {trip.passenger.firstName} {trip.passenger.lastName} · {trip.passenger.email}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Solicitado</dt>
              <dd className="font-mono text-slate-800">{formatDateTime(trip.requestedAt)}</dd>
            </div>
            {trip.acceptedAt && (
              <div>
                <dt className="font-medium text-slate-500">Aceptado</dt>
                <dd className="font-mono text-slate-800">{formatDateTime(trip.acceptedAt)}</dd>
              </div>
            )}
            {trip.completedAt && (
              <div>
                <dt className="font-medium text-slate-500">Completado</dt>
                <dd className="font-mono text-slate-800">{formatDateTime(trip.completedAt)}</dd>
              </div>
            )}
          </dl>

          {trip.status === 'IN_PROGRESS' && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="mt-6 w-full rounded-md bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {completing ? 'Completando…' : 'Completar viaje'}
            </button>
          )}

          {trip.status === 'COMPLETED' && (
            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-medium">Viaje completado</p>
              {trip.passengerRating != null ? (
                <p className="mt-1">
                  Calificación del pasajero: {'★'.repeat(trip.passengerRating)} ({trip.passengerRating}/5)
                  {trip.ratingComment && <> — {trip.ratingComment}</>}
                </p>
              ) : (
                <p className="mt-1 text-emerald-700">Aún no ha sido calificado por el pasajero.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}