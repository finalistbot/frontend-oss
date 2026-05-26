"use client";

import { AuthGuard } from "@repo/auth";
import type { ReactNode } from "react";
import { AppTopbar } from "@/components/layouts/app-topbar";
import { PlayNav } from "@/components/layouts/play-nav";
import { SiteShell } from "@/components/layouts/site-shell";

export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard redirectTo="/login" setupUsernamePath="/auth/setup-username">
      <div className="flex min-h-screen flex-col bg-background">
        <AppTopbar />
        <PlayNav />
        <main className="flex-1">
          <SiteShell>{children}</SiteShell>
        </main>
      </div>
    </AuthGuard>
  );
}
