import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import RequestTrip from './pages/passenger/RequestTrip';
import PassengerTripDetail from './pages/passenger/PassengerTripDetail';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverTripDetail from './pages/driver/DriverTripDetail';
import HistoryPage from './pages/HistoryPage';

// Raíz "/" : redirige según el estado de sesión y rol.
function Home() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Cargando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas del pasajero — Persona 2 */}
      <Route
        path="/passenger"
        element={
          <ProtectedRoute role="PASSENGER">
            <PassengerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/request"
        element={
          <ProtectedRoute role="PASSENGER">
            <RequestTrip />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/trips/:id"
        element={
          <ProtectedRoute role="PASSENGER">
            <PassengerTripDetail />
          </ProtectedRoute>
        }
      />

      {/* Rutas del conductor — Persona 3 */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/trips/:id"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverTripDetail />
          </ProtectedRoute>
        }
      />

      {/* Historial — ambos roles (Persona 3) */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
