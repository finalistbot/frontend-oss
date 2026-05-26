"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ApiClient } from "./client";

interface ApiProviderProps {
  baseUrl: string;
  refreshSession?: () => Promise<void>;
  onUnauthorized?: () => void;
  children: ReactNode;
}

const ApiContext = createContext<ApiClient | null>(null);

// Single shared client per provider tree. Refresh + unauth callbacks plug
// into whatever auth lifecycle the host app uses (typically @repo/auth).
export function ApiProvider({
  baseUrl,
  refreshSession,
  onUnauthorized,
  children,
}: ApiProviderProps) {
  const client = useMemo(
    () => new ApiClient({ baseUrl, refreshSession, onUnauthorized }),
    [baseUrl, refreshSession, onUnauthorized],
  );

  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>;
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiContext);
  if (!client) {
    throw new Error(
      "useApiClient must be used within an <ApiProvider>. Wrap your app with <ApiProvider baseUrl=...>.",
    );
  }
  return client;
}
