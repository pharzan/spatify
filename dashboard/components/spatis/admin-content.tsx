"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getStoredAuthToken, setAuthToken } from "@/lib/auth/token-storage";

import { Dashboard } from "./dashboard";
import { LoginView } from "./login-view";

export const AdminContent = () => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => getStoredAuthToken());

  const handleLogout = () => {
    setAuthToken(null);
    setToken(null);
    queryClient.clear();
  };

  if (!token) {
    return <LoginView onAuthenticated={(value) => setToken(value)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};
