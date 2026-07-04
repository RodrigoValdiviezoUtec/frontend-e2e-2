import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { getMyTripsPassenger, getMyTripsDriver } from '../api/trips';
import type { Trip, TripStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(err)) {
    const raw = (err.response?.data as { error?: string } | undefined)?.error;
    if (raw) return raw;
  }
  return fallback;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

const FILTERS: Array<{ value: TripStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'COMPLETED', label: 'Completados' },
];

export default function HistoryPage() {
  const { user } = useAuth();
  const isDriver = user?.role === 'DRIVER';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = isDriver ? await getMyTripsDriver() : await getMyTripsPassenger();
        if (!cancelled) setTrips(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'No se pudo cargar el historial.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isDriver]);

  const sortedTrips = useMemo(() => {
    const filtered = filter === 'ALL' ? trips : trips.filter((t) => t.status === filter);
    return [...filtered].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }, [trips, filter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            to={isDriver ? '/driver' : '/passenger'}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Historial de viajes</h1>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : sortedTrips.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay viajes con este estado.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Origen</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Destino</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">
                    {isDriver ? 'Pasajero' : 'Conductor'}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTrips.map((trip) => {
                  const counterpart = isDriver ? trip.passenger : trip.driver;
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                        {formatDateTime(trip.requestedAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{trip.pickupAddress}</td>
                      <td className="px-4 py-3 text-slate-700">{trip.dropoffAddress}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {counterpart ? `${counterpart.firstName} ${counterpart.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={isDriver ? `/driver/trips/${trip.id}` : `/passenger/trips/${trip.id}`}
                          className="font-medium text-slate-700 hover:underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}