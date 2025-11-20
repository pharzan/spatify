"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpatiAdminPage } from "@/components/spatis/spati-admin-page";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import { LoginCard } from "@/components/auth/login-card";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8 text-sm text-muted-foreground">
    Preparing admin panel…
  </div>
);

const ProtectedAdmin = () => {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginCard />;
  }

  return <SpatiAdminPage />;
};

const AdminApp = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProtectedAdmin />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AdminApp;
