import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip, rateTrip } from '../../api/trips';
import { getErrorMessage } from '../../api/client';
import type { Trip } from '../../types';
import StatusBadge from '../../components/StatusBadge';

export default function PassengerTripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Rating form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  
  const intervalRef = useRef<number | null>(null);

  const fetchTrip = async () => {
    if (!id) return;
    try {
      const data = await getTrip(Number(id));
      setTrip(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(getErrorMessage(err, 'Error fetching trip'));
      return null;
    }
  };

  useEffect(() => {
    fetchTrip().finally(() => setLoading(false));

    // Cleanup function to clear interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    // Stop polling if completed or error
    if (trip?.status === 'COMPLETED' || error) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling if pending or in progress
    if (trip?.status === 'PENDING' || trip?.status === 'IN_PROGRESS') {
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(fetchTrip, 3000);
      }
    }
  }, [trip?.status, error]);

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    
    setSubmittingRating(true);
    try {
      const updatedTrip = await rateTrip(trip.id, rating, comment);
      setTrip(updatedTrip);
    } catch (err: any) {
      alert(getErrorMessage(err, 'Error al enviar la calificación'));
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>;
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || 'Viaje no encontrado'}</p>
        <button onClick={() => navigate('/passenger')} className="text-blue-600 hover:underline">Volver</button>
      </div>
    );
  }

  const needsRating = trip.status === 'COMPLETED' && trip.passengerRating === null;

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
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Viaje #{trip.id}</h1>
          <StatusBadge status={trip.status} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Punto de partida</p>
              <p className="mt-1 text-gray-900 font-medium">{trip.pickupAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Destino</p>
              <p className="mt-1 text-gray-900 font-medium">{trip.dropoffAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de solicitud</p>
              <p className="mt-1 text-gray-900">{new Date(trip.requestedAt).toLocaleString()}</p>
            </div>
            {trip.acceptedAt && (
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de aceptación</p>
                <p className="mt-1 text-gray-900">{new Date(trip.acceptedAt).toLocaleString()}</p>
              </div>
            )}
            {trip.completedAt && (
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de finalización</p>
                <p className="mt-1 text-gray-900">{new Date(trip.completedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <hr className="border-gray-100" />
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Conductor</h3>
            {trip.driver ? (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{trip.driver.firstName} {trip.driver.lastName}</p>
                  <p className="text-sm text-gray-500">{trip.driver.email}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-yellow-500 font-medium">★ {trip.driver.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <p className="text-yellow-700 font-medium">Buscando conductor...</p>
              </div>
            )}
          </div>
        </div>

        {needsRating && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">¡Califica tu viaje!</h2>
            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puntuación (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
                <div className="text-center mt-2 font-medium text-xl text-yellow-500">
                  {Array.from({ length: rating }).map(() => '★').join('')}
                  {Array.from({ length: 5 - rating }).map(() => '☆').join('')}
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario (opcional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="¿Qué tal estuvo el viaje?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={submittingRating}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {submittingRating ? 'Enviando...' : 'Enviar calificación'}
              </button>
            </form>
          </div>
        )}
        
        {trip.status === 'COMPLETED' && trip.passengerRating !== null && (
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu calificación</h3>
            <div className="flex items-center gap-2 mb-2 text-yellow-500">
              {Array.from({ length: trip.passengerRating }).map(() => '★').join('')}
              {Array.from({ length: 5 - trip.passengerRating }).map(() => '☆').join('')}
            </div>
            {trip.ratingComment && (
              <p className="text-gray-600 italic">"{trip.ratingComment}"</p>
            )}
           </div>
        )}
      </div>
    </div>
  );
}
