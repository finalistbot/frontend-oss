"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../providers/auth-provider";

type AuthGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
  setupUsernamePath?: string;
  enforceUsernameSetup?: boolean;
  fallback?: React.ReactNode;
};

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function navigate(router: ReturnType<typeof useRouter>, target: string) {
  if (isAbsoluteUrl(target)) {
    window.location.assign(target);
    return;
  }

  router.replace(target);
}

export function AuthGuard({
  children,
  redirectTo = "/login",
  setupUsernamePath = "/auth/setup-username",
  enforceUsernameSetup = true,
  fallback = null,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, requiresUsername } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate(router, redirectTo);
      return;
    }

    if (enforceUsernameSetup && requiresUsername && pathname !== setupUsernamePath) {
      navigate(router, setupUsernamePath);
    }
  }, [
    enforceUsernameSetup,
    isAuthenticated,
    isLoading,
    pathname,
    redirectTo,
    requiresUsername,
    router,
    setupUsernamePath,
  ]);

  if (isLoading) return <>{fallback}</>;
  if (!isAuthenticated) return <>{fallback}</>;
  if (enforceUsernameSetup && requiresUsername && pathname !== setupUsernamePath) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
