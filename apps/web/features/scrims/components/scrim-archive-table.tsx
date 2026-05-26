"use client";

import Link from "next/link";
import { Lock, Trophy } from "lucide-react";
import type { Scrim } from "@repo/api";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@/lib/utils";

export interface ScrimArchiveRow {
  scrim: Scrim;
  href: string;
  organization?: { name: string; logoUrl?: string };
  winner?: { name: string; logoUrl?: string };
}

interface ScrimArchiveTableProps {
  rows: ScrimArchiveRow[];
}

export function ScrimArchiveTable({ rows }: ScrimArchiveTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="hidden grid-cols-[1fr_auto_180px] items-center gap-4 border-b border-border bg-muted-background px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
        <span>Title</span>
        <span className="text-center">Slots</span>
        <span className="text-right">Winner</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.scrim.id}>
            <ArchiveRow row={row} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArchiveRow({ row }: { row: ScrimArchiveRow }) {
  const { scrim, href, organization, winner } = row;
  const closedAt = new Date(scrim.ends_at ?? scrim.updated_at);
  const cancelled = scrim.status === "cancelled";
  const slotsLabel =
    typeof scrim.max_slots === "number" ? `${scrim.max_slots} slots` : "—";

  return (
    <Link
      href={href}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-muted-background/60 md:grid-cols-[auto_1fr_auto_180px] md:px-5"
    >
      <Avatar
        name={organization?.name ?? scrim.name}
        imageUrl={organization?.logoUrl}
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={cancelled ? "destructive" : "secondary"}
            className={
              cancelled
                ? "rounded-sm text-[10px] font-bold uppercase tracking-[0.14em]"
                : "rounded-sm bg-muted text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
            }
          >
            {cancelled ? "Cancelled" : "Completed"}
          </Badge>
          <span className="truncate text-sm font-semibold text-foreground">
            {scrim.name}
          </span>
          <Lock
            className="size-3.5 shrink-0 text-muted-foreground/60"
            aria-label="Archived"
          />
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {organization?.name ?? "Independent"}
          <span className="mx-1.5 text-muted-foreground/50">·</span>
          <RelativeDate date={closedAt} />
        </p>
      </div>

      <span className="hidden text-center text-sm font-medium tabular-nums text-muted-foreground md:block">
        {slotsLabel}
      </span>

      <WinnerCell winner={winner} />
    </Link>
  );
}

function WinnerCell({ winner }: { winner?: ScrimArchiveRow["winner"] }) {
  if (!winner) {
    return (
      <span className="hidden text-right text-xs uppercase tracking-[0.14em] text-muted-foreground/60 md:block">
        —
      </span>
    );
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-semibold text-foreground">
          {winner.name}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          <Trophy className="mr-1 inline size-3 -translate-y-px" />
          Winner
        </p>
      </div>
      <Avatar name={winner.name} imageUrl={winner.logoUrl} size="sm" />
    </div>
  );
}

function Avatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "size-8 text-[11px]" : "size-10 text-sm";
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={cn(
          "shrink-0 rounded-full border border-border object-cover",
          sizeClass,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary/15 font-bold uppercase text-primary",
        sizeClass,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function RelativeDate({ date }: { date: Date }) {
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const wasYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (sameDay) return <>Today at {time}</>;
  if (wasYesterday) return <>Yesterday at {time}</>;
  return (
    <>
      {date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </>
  );
}
