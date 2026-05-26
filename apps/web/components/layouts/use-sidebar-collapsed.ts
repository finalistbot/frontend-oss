"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "finalist.sidebar_collapsed";
// Force the sidebar into icon-only mode below Tailwind's `lg` breakpoint so
// phones/tablets don't waste their narrow viewport on a 288px nav rail.
const COMPACT_QUERY = "(max-width: 1023px)";

interface UseSidebarCollapsedResult {
  collapsed: boolean;
  setCollapsed: (next: boolean | ((current: boolean) => boolean)) => void;
  isCompact: boolean;
}

// Persists the manage-sidebar preference in localStorage so it survives reload.
// Below the compact breakpoint the sidebar is force-collapsed regardless of
// the stored preference; the desktop choice is restored as soon as the
// viewport widens again.
export function useSidebarCollapsed(): UseSidebarCollapsedResult {
  const [stored, setStored] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value !== null) setStored(value === "1");
    } catch {
      // localStorage can be unavailable; fall back to expanded.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(COMPACT_QUERY);
    const apply = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsCompact(event.matches);
    };
    apply(mql);
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const setCollapsed = useCallback(
    (next: boolean | ((current: boolean) => boolean)) => {
      setStored((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        try {
          window.localStorage.setItem(STORAGE_KEY, resolved ? "1" : "0");
        } catch {
          // Quota / disabled storage — fall through silently.
        }
        return resolved;
      });
    },
    [],
  );

  return {
    collapsed: isCompact || stored,
    setCollapsed,
    isCompact,
  };
}
