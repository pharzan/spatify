"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminLoginPayload } from "@/lib/api/auth";
import { login as loginRequest } from "@/lib/api/auth";
import { getStoredAuthToken, setAuthToken } from "@/lib/auth/token-storage";

interface AuthContextValue {
  token: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  loginError: Error | null;
  login: (payload: AdminLoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getStoredAuthToken());
  const isReady = true;

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const loginMutation = useMutation({
    mutationFn: (payload: AdminLoginPayload) => loginRequest(payload),
    onSuccess: async (data) => {
      setToken(data.token);
      await queryClient.invalidateQueries();
    },
  });

  const logout = useCallback(async () => {
    setToken(null);
    await queryClient.clear();
  }, [queryClient]);

  const value: AuthContextValue = {
    token,
    isReady,
    isAuthenticated: Boolean(token),
    isLoggingIn: loginMutation.isPending,
    loginError: (loginMutation.error as Error) ?? null,
    login: (payload) => loginMutation.mutateAsync(payload),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
