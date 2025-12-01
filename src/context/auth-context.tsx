"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const ACCESS_TOKEN_KEY = "acebook.accessToken";
const REFRESH_TOKEN_KEY = "acebook.refreshToken";
const USER_STORAGE_KEY = "acebook.user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = useCallback((value: User | null) => {
    if (value) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const clearTokens = useCallback(() => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    persistUser(null);
  }, [persistUser]);

  const refreshProfile = useCallback(async () => {
    const hasToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!hasToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.auth.me();
      setUser(data);
      persistUser(data);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, [clearTokens, persistUser]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(
    async ({ identifier, password }: { identifier: string; password: string }) => {
      try {
        const { data } = await api.auth.login({ email: identifier, password });
        window.localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        window.localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
        setUser(data.user);
        persistUser(data.user);
      } catch (error) {
        const status = (error as Error & { status?: number }).status;
        if (status === 401) {
          throw new Error("Credenciais inválidas. Verifique email e senha.");
        }
        throw error;
      }
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }
  return context;
}
