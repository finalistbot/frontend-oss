"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "finalist.active_org_id";

interface ActiveOrgContextValue {
  // The org the /manage surface is currently scoped to. `null` means
  // "all organizations" — pages should show everything the caller can host.
  activeOrgId: number | null;
  setActiveOrgId: (id: number | null) => void;
  // False until the persisted value has been read on the client, so consumers
  // can avoid filtering on a stale `null` during the first paint.
  ready: boolean;
}

const ActiveOrgContext = createContext<ActiveOrgContextValue | null>(null);

// Holds the "current organization" for the whole /manage surface. The org
// switcher writes it; scrims (and other org-scoped views) read it to filter
// down to a single workspace. Persisted in localStorage so the choice
// survives reloads, mirroring useSidebarCollapsed.
export function ActiveOrgProvider({ children }: { children: ReactNode }) {
  const [activeOrgId, setState] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      const parsed = value ? Number(value) : NaN;
      if (Number.isFinite(parsed) && parsed > 0) setState(parsed);
    } catch {
      // localStorage unavailable — default to "all organizations".
    }
    setReady(true);
  }, []);

  const setActiveOrgId = useCallback((id: number | null) => {
    setState(id);
    try {
      if (id === null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // Quota / disabled storage — selection just won't survive reload.
    }
  }, []);

  const value = useMemo(
    () => ({ activeOrgId, setActiveOrgId, ready }),
    [activeOrgId, setActiveOrgId, ready],
  );

  return (
    <ActiveOrgContext.Provider value={value}>
      {children}
    </ActiveOrgContext.Provider>
  );
}

export function useActiveOrg(): ActiveOrgContextValue {
  const ctx = useContext(ActiveOrgContext);
  if (!ctx) {
    throw new Error("useActiveOrg must be used within an ActiveOrgProvider");
  }
  return ctx;
}
