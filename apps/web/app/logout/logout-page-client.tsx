"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@repo/auth";
import { clearPendingRedirectTarget } from "@/features/login/constants";

export default function LogoutPageClient() {
  const router = useRouter();
  const { logout } = useAuth();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    async function finishLogout() {
      clearPendingRedirectTarget();

      try {
        await logout();
      } catch {
        // Logout should still complete locally if backend revoke fails.
      } finally {
        router.replace("/login");
      }
    }

    void finishLogout();
  }, [logout, router]);

  return null;
}
