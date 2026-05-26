"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Team } from "@repo/api";
import { CalendarDays, Crown, Hash, UsersRound } from "lucide-react";

interface TeamCardProps {
  team: Team;
  href: string;
  // True when the current user is captain of this team.
  isCaptain: boolean;
}

export function TeamCard({ team, href, isCaptain }: TeamCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted-background">
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-card to-background">
          <span className="font-primary text-4xl font-black uppercase tracking-[0.18em] text-foreground/55">
            {teamInitials(team.name)}
          </span>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/95 via-card/20 to-transparent"
        />

        {isCaptain ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-sm">
            <Crown className="size-3" />
            Captain
          </span>
        ) : (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-border bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground shadow-sm backdrop-blur">
            <UsersRound className="mr-1 size-3" />
            Member
          </span>
        )}

        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-border bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground shadow-sm backdrop-blur">
          <Hash className="size-3" />
          {team.team_code}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 font-primary text-base font-bold uppercase leading-tight tracking-[0.02em] text-foreground sm:text-lg">
              {team.name}
            </h3>
          </div>
        </div>

        <dl className="space-y-1.5">
          <InfoRow
            icon={<Crown className="size-3.5" />}
            label="Captain"
            value={`#${team.captain_id}`}
          />
          <InfoRow
            icon={<CalendarDays className="size-3.5" />}
            label="Created"
            value={fmtDate(team.created_at)}
          />
        </dl>
      </div>
    </Link>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label?: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0 flex-1">
        {label ? (
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
            {label}
          </div>
        ) : null}
        <div className="truncate text-xs font-semibold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function teamInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
