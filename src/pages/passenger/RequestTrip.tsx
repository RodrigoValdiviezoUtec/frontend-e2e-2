import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDrivers } from '../../api/drivers';
import { createTrip } from '../../api/trips';
import { getErrorMessage } from '../../api/client';
import type { User } from '../../types';

export default function RequestTrip() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    getAvailableDrivers()
      .then(setDrivers)
      .catch((err) => {
        console.error('Error fetching drivers', err);
      })
      .finally(() => setLoadingDrivers(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress || !dropoffAddress) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const trip = await createTrip(pickupAddress, dropoffAddress);
      navigate(`/passenger/trips/${trip.id}`);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Error al solicitar viaje'));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/passenger')}
            className="text-gray-500 hover:text-gray-900"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Solicitar un Viaje</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Punto de partida
              </label>
              <input
                id="pickupAddress"
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Ej: Av. 18 de Julio 1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="dropoffAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Destino
              </label>
              <input
                id="dropoffAddress"
                type="text"
                required
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Ej: Tres Cruces"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !pickupAddress || !dropoffAddress}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Solicitando...' : 'Confirmar Viaje'}
          </button>
        </form>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conductores disponibles en la zona</h2>
          {loadingDrivers ? (
            <p className="text-gray-500 text-sm">Buscando conductores...</p>
          ) : drivers.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay conductores disponibles en este momento, pero puedes solicitar un viaje igual para que quede en espera.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {drivers.map(driver => (
                <li key={driver.id} className="py-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{driver.firstName} {driver.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span>★</span>
                    <span className="text-gray-700 font-medium">{driver.rating.toFixed(1)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
