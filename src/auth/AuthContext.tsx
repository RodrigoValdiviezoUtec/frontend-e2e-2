import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { RegisterPayload, User } from '../types';
import { getMe, login as apiLogin, register as apiRegister } from '../api/auth';
import { TOKEN_KEY } from '../api/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true mientras se resuelve la sesión inicial
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function setSession(token: string): Promise<User> {
    localStorage.setItem(TOKEN_KEY, token);
    const me = await getMe();
    setUser(me);
    return me;
  }

  async function login(email: string, password: string): Promise<User> {
    const token = await apiLogin(email, password);
    return setSession(token);
  }

  async function register(payload: RegisterPayload): Promise<User> {
    const token = await apiRegister(payload);
    return setSession(token);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
