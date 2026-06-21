import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { api, clearStoredToken, getStoredToken, setStoredToken } from '@/lib/api';
import { unregisterPushToken } from '@/lib/push';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  verified?: boolean;
};

type AuthResponse = { token: string; user: AuthUser };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate the session from a stored token on boot.
  useEffect(() => {
    (async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          const { user } = await api<{ user: AuthUser | null }>('/api/auth/me');
          setUser(user);
        }
      } catch {
        await clearStoredToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api<AuthResponse>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    await setStoredToken(token);
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user } = await api<AuthResponse>('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: { name, email, password },
    });
    await setStoredToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    // Stop receiving call pushes on this device before dropping the session.
    await unregisterPushToken();
    await clearStoredToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
