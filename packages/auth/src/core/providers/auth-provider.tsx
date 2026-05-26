"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AuthAPI } from "../../api/auth-api";
import { SharedAuthAPIClient } from "../../api/auth-client";
import type {
  AuthProviderConfig,
  EmailOTPChallenge,
  User,
  UsernameAvailability,
} from "../../types/auth-types";
import { useAuthStore } from "../auth/stores/auth";
import { QueryProvider } from "./query-provider";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  requiresUsername: boolean;
  requestEmailOTP: (email: string) => Promise<EmailOTPChallenge>;
  verifyEmailOTP: (challengeId: string, code: string) => Promise<User>;
  refreshSession: () => Promise<User>;
  updateUsername: (username: string) => Promise<User>;
  checkUsernameAvailability: (username: string) => Promise<UsernameAvailability>;
  clearSession: () => void;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
  config?: AuthProviderConfig;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toBaseUrl(value?: string) {
  if (value) return value.endsWith("/") ? value.slice(0, -1) : value;
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

function AuthProviderInner({ children, config }: AuthProviderProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const sessionRevisionRef = useRef(0);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const login = useAuthStore((state) => state.login);
  const markRequiresUsername = useAuthStore((state) => state.markRequiresUsername);
  const logoutStore = useAuthStore((state) => state.logout);
  const startBootstrap = useAuthStore((state) => state.startBootstrap);
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap);
  const setUser = useAuthStore((state) => state.setUser);

  const api = useMemo(() => {
    const baseUrl = toBaseUrl(config?.apiBaseUrl);
    const client = new SharedAuthAPIClient(
      baseUrl,
      async () => {
        const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        });

        const contentType = response.headers.get("content-type");
        const payload = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          throw new Error(
            typeof payload === "string"
              ? payload
              : "Failed to refresh authentication session",
          );
        }
      },
      () => {
        sessionRevisionRef.current += 1;
        markRequiresUsername();
      },
      () => {
        sessionRevisionRef.current += 1;
        logoutStore();
      },
    );
    return new AuthAPI(client);
  }, [config?.apiBaseUrl, logoutStore, markRequiresUsername]);

  useEffect(() => {
    let cancelled = false;
    const sessionRevision = sessionRevisionRef.current;

    async function bootstrap() {
      startBootstrap();

      try {
        const nextUser = await api.bootstrapUser();

        if (!cancelled && sessionRevisionRef.current === sessionRevision) {
          setUser(nextUser);
        }
      } catch {
        if (!cancelled && sessionRevisionRef.current === sessionRevision) {
          logoutStore();
        }
      } finally {
        if (!cancelled && sessionRevisionRef.current === sessionRevision) {
          finishBootstrap();
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [api, finishBootstrap, logoutStore, setUser, startBootstrap]);

  async function runWithPending<T>(action: () => Promise<T>) {
    setPendingCount((count) => count + 1);

    try {
      return await action();
    } finally {
      setPendingCount((count) => count - 1);
    }
  }

  const requestEmailOTP = useCallback(
    (email: string) => runWithPending(() => api.requestEmailOTP({ email })),
    [api],
  );

  const verifyEmailOTP = useCallback(
    (challengeId: string, code: string) =>
      runWithPending(async () => {
        sessionRevisionRef.current += 1;
        const nextUser = await api.verifyEmailOTP({
          challenge_id: challengeId,
          code,
        });
        login(nextUser);
        return nextUser;
      }),
    [api, login],
  );

  const refreshSession = useCallback(
    () =>
      runWithPending(async () => {
        sessionRevisionRef.current += 1;
        await api.refresh();
        const nextUser = await api.getMe();
        login(nextUser);
        return nextUser;
      }),
    [api, login],
  );

  const updateUsername = useCallback(
    (username: string) =>
      runWithPending(async () => {
        sessionRevisionRef.current += 1;
        const nextUser = await api.updateUsername({ username });
        login(nextUser);
        return nextUser;
      }),
    [api, login],
  );

  const checkUsernameAvailability = useCallback(
    (username: string) => api.checkUsernameAvailability(username),
    [api],
  );

  const logout = useCallback(async () => {
    sessionRevisionRef.current += 1;
    logoutStore();

    try {
      await api.logout();
    } catch {
      // Local logout should still succeed even if session revocation fails.
    }
  }, [api, logoutStore]);

  const clearSession = useCallback(() => {
    sessionRevisionRef.current += 1;
    api.clearSession();
    logoutStore();
  }, [api, logoutStore]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading: isBootstrapping || pendingCount > 0,
      isBootstrapping,
      requiresUsername: Boolean(user?.requires_username),
      requestEmailOTP,
      verifyEmailOTP,
      refreshSession,
      updateUsername,
      checkUsernameAvailability,
      clearSession,
      logout,
    }),
    [
      checkUsernameAvailability,
      clearSession,
      isAuthenticated,
      isBootstrapping,
      logout,
      pendingCount,
      refreshSession,
      requestEmailOTP,
      updateUsername,
      user,
      verifyEmailOTP,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  return (
    <QueryProvider>
      <AuthProviderInner config={config}>{children}</AuthProviderInner>
    </QueryProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
