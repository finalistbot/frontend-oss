"use client";

import { ApiProvider } from "@repo/api";
import { AuthProvider, useAuth } from "@repo/auth";
import type { ReactNode } from "react";
import { appConfig } from "@/config";
import { ThemeProvider } from "@/core/theme";

// ApiBridge plumbs the existing AuthProvider's refresh + clear hooks into
// @repo/api so a 401 inside any data hook triggers the same refresh path as
// the auth bootstrap. Sits inside AuthProvider so useAuth() is available.
function ApiBridge({ children }: { children: ReactNode }) {
  const { refreshSession, clearSession } = useAuth();
  return (
    <ApiProvider
      baseUrl={appConfig.apiBaseUrl}
      refreshSession={async () => {
        await refreshSession();
      }}
      onUnauthorized={() => clearSession()}
    >
      {children}
    </ApiProvider>
  );
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider config={{ apiBaseUrl: appConfig.apiBaseUrl }}>
        <ApiBridge>{children}</ApiBridge>
      </AuthProvider>
    </ThemeProvider>
  );
}
