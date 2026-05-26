"use client";

import { AuthGuard } from "@repo/auth";
import type { ReactNode } from "react";
import { AppTopbar } from "@/components/layouts/app-topbar";
import { SiteShell } from "@/components/layouts/site-shell";

// Global profile route — reachable from both /play and /manage via the
// account menu, so it carries only the shared topbar chrome (no surface nav).
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard redirectTo="/login" setupUsernamePath="/auth/setup-username">
      <div className="flex min-h-screen flex-col bg-background">
        <AppTopbar />
        <main className="flex-1">
          <SiteShell>{children}</SiteShell>
        </main>
      </div>
    </AuthGuard>
  );
}
