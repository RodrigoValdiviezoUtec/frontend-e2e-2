import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getMyTripsPassenger } from '../../api/trips';
import { getErrorMessage } from '../../api/client';
import type { Trip } from '../../types';
import StatusBadge from '../../components/StatusBadge';

export default function PassengerDashboard() {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyTripsPassenger()
      .then(setTrips)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola, {user?.firstName}!
            </h1>
            <p className="text-gray-500">Pasajero</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/passenger/request')}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Pedir Viaje
            </button>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Mis Viajes</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Cargando viajes...</p>
            ) : error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : trips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tienes viajes registrados.</p>
                <button
                  onClick={() => navigate('/passenger/request')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  ¡Solicita tu primer viaje!
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {trips.map((trip) => (
                  <li key={trip.id} className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors px-2 -mx-2 rounded">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs sm:max-w-md">
                        {trip.pickupAddress} <span className="text-gray-400 font-normal mx-2">→</span> {trip.dropoffAddress}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(trip.requestedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={trip.status} />
                      <Link
                        to={`/passenger/trips/${trip.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
