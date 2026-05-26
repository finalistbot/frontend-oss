"use client";

import { AuthGuard } from "@repo/auth";
import type { ReactNode } from "react";
import { ActiveOrgProvider } from "@/components/layouts/active-org";
import { AppTopbar } from "@/components/layouts/app-topbar";
import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";
import { useSidebarCollapsed } from "@/components/layouts/use-sidebar-collapsed";

export default function ManageLayout({ children }: { children: ReactNode }) {
  const { collapsed, setCollapsed, isCompact } = useSidebarCollapsed();

  return (
    <AuthGuard redirectTo="/login" setupUsernamePath="/auth/setup-username">
      <ActiveOrgProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-background">
          <AppTopbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed((value) => !value)}
              showToggle={!isCompact}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
                {children}
              </main>
            </div>
          </div>
        </div>
      </ActiveOrgProvider>
    </AuthGuard>
  );
}
