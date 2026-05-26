"use client";

import Link from "next/link";
import { Archive } from "lucide-react";

interface ScrimArchiveBarProps {
  href: string;
  totalCount: number;
  // Combined count of completed + cancelled scrims (everything in the archive).
  archivedCount: number;
  // Most recent archived scrim teaser. Shown on the right when present.
  recent?: {
    name: string;
    // Free-form subtitle e.g. "Today at 09:30 · Lalit Sellbuy".
    meta?: string;
    avatarUrl?: string;
  };
}

export function ScrimArchiveBar({
  href,
  totalCount,
  archivedCount,
  recent,
}: ScrimArchiveBarProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-5 rounded-xl border border-border bg-card px-5 py-3.5 text-card-foreground transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-md bg-muted-background text-muted-foreground">
          <Archive className="size-4" />
        </span>
        <span className="text-base font-bold uppercase tracking-[0.08em] text-foreground">
          Archive
        </span>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <Stat value={totalCount} label="Scrims" />
        <span aria-hidden className="h-9 w-px bg-border" />
        <Stat value={archivedCount} label="Archived" />
      </div>

      {recent ? (
        <>
          <span aria-hidden className="h-9 w-px bg-border" />
          <div className="hidden min-w-0 max-w-[280px] items-center gap-3 sm:flex">
            {recent.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recent.avatarUrl}
                alt=""
                className="size-7 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="size-7 shrink-0 rounded-full bg-primary/20" aria-hidden />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                {recent.name}
              </p>
              {recent.meta ? (
                <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {recent.meta}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </Link>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-right">
      <div className="text-2xl font-bold leading-none tabular-nums text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
