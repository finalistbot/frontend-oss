"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FinalistMark } from "@/components/finalist-mark";
import {
  CommandPalette,
  useCommandPaletteShortcut,
} from "./command-palette";
import { ProfileMenu } from "./profile-menu";
import { SurfaceSwitcher } from "./surface-switcher";
import { useGoShortcuts } from "./use-go-shortcuts";

interface AppTopbarProps {
  // Optional element rendered between the search trigger and the profile menu.
  // Use for surface-specific controls (e.g. notification bell on /manage).
  extras?: ReactNode;
}

// Shared chrome for /play and /manage. Three slots: brand, surface switch,
// account. Sticky so the door is always visible while the page scrolls.
export function AppTopbar({ extras }: AppTopbarProps) {
  const [paletteOpen, setPaletteOpen] = useCommandPaletteShortcut();
  useGoShortcuts();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/65 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/play"
            className="flex items-center gap-2 text-sm font-semibold tracking-[0.32em] text-foreground"
            aria-label="Finalist home"
          >
            <FinalistMark />
            <span className="hidden sm:inline">INALIST</span>
          </Link>

          <span aria-hidden className="hidden h-5 w-px bg-border sm:block" />

          <SurfaceSwitcher />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 items-center gap-2 rounded-md border border-border bg-muted-background/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted-background hover:text-foreground focus-visible:border-ring focus-visible:outline-none"
            aria-label="Open command palette"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
              ⌘K
            </kbd>
          </button>

          {extras}
          <ProfileMenu />
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}

