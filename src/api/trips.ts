import api from './client';
import type { Trip } from '../types';

// POST /trips — el pasajero solicita un viaje (queda PENDING). [Persona 2]
export async function createTrip(pickupAddress: string, dropoffAddress: string): Promise<Trip> {
  const { data } = await api.post<Trip>('/trips', { pickupAddress, dropoffAddress });
  return data;
}

// GET /trips — historial de viajes del pasajero autenticado. [Persona 2 / 7]
export async function getMyTripsPassenger(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips');
  return data;
}

// GET /trips/pending — viajes PENDING disponibles para aceptar. [Persona 3]
export async function getPendingTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips/pending');
  return data;
}

// GET /trips/my — historial de viajes del conductor autenticado. [Persona 3 / 7]
export async function getMyTripsDriver(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips/my');
  return data;
}

// GET /trips/{id} — detalle de un viaje. [Persona 2 y 3]
export async function getTrip(id: number): Promise<Trip> {
  const { data } = await api.get<Trip>(`/trips/${id}`);
  return data;
}

// PATCH /trips/{id}/accept — el conductor acepta un viaje PENDING. [Persona 3]
export async function acceptTrip(id: number): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${id}/accept`);
  return data;
}

// PATCH /trips/{id}/complete — el conductor completa el viaje. [Persona 3]
export async function completeTrip(id: number): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${id}/complete`);
  return data;
}

// POST /trips/{id}/rate — el pasajero califica el viaje (1-5). [Persona 2]
export async function rateTrip(id: number, rating: number, comment?: string): Promise<Trip> {
  const { data } = await api.post<Trip>(`/trips/${id}/rate`, { rating, comment });
  return data;
}
