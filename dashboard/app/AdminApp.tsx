"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpatiAdminPage } from "@/components/spatis/spati-admin-page";

const AdminApp = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SpatiAdminPage />
    </QueryClientProvider>
  );
};

export default AdminApp;
