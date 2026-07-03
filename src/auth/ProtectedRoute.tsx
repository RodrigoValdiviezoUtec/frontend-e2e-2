import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../types';
import { useAuth } from './AuthContext';

interface Props {
  children: ReactNode;
  role?: Role; // si se define, solo ese rol puede entrar
}

// Guard de rutas: exige sesión y, opcionalmente, un rol específico.
export function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Cargando…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Rol equivocado → lo mandamos a su propio dashboard.
    return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
  }

  return <>{children}</>;
}
