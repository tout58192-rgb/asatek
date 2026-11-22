import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  getCurrentAdmin,
  signInAdmin,
  signOutAdmin,
  type AdminUser,
} from '../services/auth';

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentAdmin()
      .then((user) => {
        if (active) setAdmin(user);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const subscription =
      isSupabaseConfigured && supabase
        ? supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT' && active) {
              setAdmin(null);
            }
          }).data.subscription
        : null;

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await signInAdmin(email, password);
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await signOutAdmin();
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
