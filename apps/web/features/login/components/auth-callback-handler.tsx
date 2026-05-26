"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@repo/auth";
import { RedirectSplash } from "@/components/redirect-splash";
import { AuthShell } from "./auth-shell";
import {
  clearPendingRedirectTarget,
  getNextTarget,
} from "../constants";

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, requiresUsername } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const nextTarget = useMemo(
    () => getNextTarget(searchParams.get("next")),
    [searchParams],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setError("No authenticated session was found after the sign-in redirect.");
      router.replace(`/login?next=${encodeURIComponent(nextTarget)}`);
      return;
    }

    if (requiresUsername) {
      router.replace(`/auth/setup-username?next=${encodeURIComponent(nextTarget)}`);
      return;
    }

    clearPendingRedirectTarget();
    window.location.assign(nextTarget);
  }, [isAuthenticated, isLoading, nextTarget, requiresUsername, router]);

  // Surfaced error => fall back to the auth shell card so the user can read it.
  // Otherwise the OAuth → /play hop is one continuous splash.
  if (error) {
    return (
      <AuthShell>
        <div className="w-full max-w-[430px] rounded-2xl border border-white/6 bg-[#121a2d] p-5 text-center shadow-[0_28px_80px_rgba(0,0,0,0.36)]">
          <h1 className="text-2xl font-semibold text-white">Sign-in failed</h1>
          <p className="mt-4 text-sm text-red-400">{error}</p>
        </div>
      </AuthShell>
    );
  }

  return <RedirectSplash message="Completing sign-in..." />;
}
