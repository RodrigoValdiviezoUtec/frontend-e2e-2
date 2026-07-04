import api from './client';
import type { User } from '../types';

// GET /drivers/available — obtiene los conductores disponibles [Persona 2]
export async function getAvailableDrivers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/drivers/available');
  return data;
}
