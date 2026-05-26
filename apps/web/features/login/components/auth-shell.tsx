"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { GameSupport } from "@/components/game-support";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#070d1b] text-white">
      <header className="border-b border-white/5 bg-[#10192b]/95">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/login"
            className="text-sm font-semibold tracking-[0.55em] text-white/90"
          >
            FINALIST
          </Link>

          <div className="flex items-center gap-3 text-sm text-white/60">
            <span className="h-7 w-7 rounded-full bg-white/20" />
            <span className="hidden sm:inline">WiperR</span>
          </div>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </section>

      <footer className="border-t border-white/5 px-4 py-12 sm:px-6">
        <GameSupport className="mx-auto max-w-[1400px]" />
      </footer>
    </main>
  );
}
