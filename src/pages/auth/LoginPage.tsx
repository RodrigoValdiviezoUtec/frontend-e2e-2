import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Role, User } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { getErrorMessage } from '../../api/client';

type Mode = 'login' | 'register';

// Manda a cada usuario a su dashboard según el rol.
function homeFor(user: User): string {
  return user.role === 'PASSENGER' ? '/passenger' : '/driver';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos del formulario.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await register({ firstName, lastName, email, password, role });
      navigate(homeFor(user), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo completar la operación'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">Uber Clone</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
        </p>

        {/* Tabs Login / Registro */}
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-medium">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`rounded-md py-2 transition ${
                mode === m ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
              }`}
            >
              {m === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre" value={firstName} onChange={setFirstName} required autoComplete="given-name" />
              <Field label="Apellido" value={lastName} onChange={setLastName} required autoComplete="family-name" />
            </div>
          )}

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
            placeholder="ana@uber.com"
          />
          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="mínimo 6 caracteres"
          />

          {mode === 'register' && (
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Rol</span>
              <div className="grid grid-cols-2 gap-3">
                {(['PASSENGER', 'DRIVER'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      role === r
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {r === 'PASSENGER' ? 'Pasajero' : 'Conductor'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-2.5 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Input reutilizable.
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

function Field({ label, value, onChange, type = 'text', required, placeholder, autoComplete }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
      />
    </label>
  );
}
