import axios from 'axios';

// URL base del backend (Spring Boot en el puerto 8080).
export const API_BASE_URL = 'http://localhost:8080';
export const TOKEN_KEY = 'token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor: adjunta el JWT en cada request si existe.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: si el backend responde 401, limpia el token y
// redirige a /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Extrae el mensaje de error del backend.
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.error === 'string') return record.error;
      const first = Object.values(record).find((v) => typeof v === 'string');
      if (typeof first === 'string') return first;
    }
    if (error.message) return error.message;
  }
  return fallback;
}

export default api;
