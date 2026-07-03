import api from './client';
import type { RegisterPayload, User } from '../types';

interface TokenResponse {
  token: string;
}

// POST /auth/login — devuelve el JWT.
export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
  return data.token;
}

// POST /auth/register — crea el usuario y devuelve el JWT.
export async function register(payload: RegisterPayload): Promise<string> {
  const { data } = await api.post<TokenResponse>('/auth/register', payload);
  return data.token;
}

// GET /users/me — perfil del usuario autenticado.
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}
