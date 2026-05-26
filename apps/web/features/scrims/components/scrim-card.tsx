"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Scrim, ScrimStatus } from "@repo/api";
import { CalendarDays, Clock, Hourglass, UsersRound } from "lucide-react";

interface ScrimCardProps {
  scrim: Scrim;
  // Where the card navigates on click. Caller picks /play or /manage.
  href: string;
  // Game display name resolved by the parent from the catalog.
  gameName?: string;
  // Pretty-printed platform label (e.g. "Mobile", "PC"). Optional pill row.
  platformLabel?: string;
  // Organizing org. When present, renders as a chip on the hero bottom-left.
  organization?: { name: string; logoUrl?: string };
  // "11/128" style indicator. Falls back to max_slots when not supplied.
  slotsLabel?: string;
  // Optional override for the top-right hero pill — replaces the countdown
  // (e.g. a Register button on /play). stopPropagation if it shouldn't also
  // trigger the card-level Link.
  action?: ReactNode;
}

const FINALIST_LOGO = "/logo.svg";

export function ScrimCard({
  scrim,
  href,
  gameName,
  platformLabel,
  organization,
  slotsLabel,
  action,
}: ScrimCardProps) {
  const thumbnail = scrim.thumbnail_url?.trim() ?? "";
  const hasThumbnail = thumbnail.length > 0;
  const countdown = relativeCountdown(scrim);
  const slots = slotsLabel ?? `${scrim.max_slots ?? "—"}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted-background">
        {hasThumbnail ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbnail}
            alt=""
            aria-hidden
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-card to-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FINALIST_LOGO}
              alt="Finalist"
              aria-hidden
              className="h-2/3 max-h-20 w-auto opacity-60"
            />
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/95 via-card/20 to-transparent"
        />

        <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-sm">
          {scrimStatusLabel(scrim.status)}
        </span>

        {countdown ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-border bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground shadow-sm backdrop-blur">
            <Hourglass className="size-3" />
            {countdown}
          </span>
        ) : null}

        {organization ? (
          <div className="absolute bottom-3 left-3 flex max-w-[80%] items-center gap-2">
            {organization.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={organization.logoUrl}
                alt=""
                aria-hidden
                className="size-7 shrink-0 rounded-full border border-border/60 bg-card object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full border border-border/60 bg-card text-[10px] font-bold uppercase text-foreground"
              >
                {orgInitials(organization.name)}
              </span>
            )}
            <span className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-foreground drop-shadow">
              {organization.name}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 font-primary text-base font-bold uppercase leading-tight tracking-[0.02em] text-foreground sm:text-lg">
              {scrim.name}
            </h3>
            {scrim.description ? (
              <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                {scrim.description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        <dl className="space-y-1.5">
          <InfoRow
            icon={<CalendarDays className="size-3.5" />}
            label="Registration"
            value={`${fmtDateTime(scrim.registration_open_at)} – ${fmtDateTime(scrim.registration_close_at)}`}
          />
          <InfoRow
            icon={<Clock className="size-3.5" />}
            label="Scrim"
            value={`${fmtDateTime(scrim.starts_at)} – ${fmtDateTime(scrim.ends_at)}`}
          />
          <InfoRow
            icon={<UsersRound className="size-3.5" />}
            value={`${slots} Teams`}
          />
        </dl>

        {gameName || platformLabel ? (
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            {gameName ? <Pill>{gameName}</Pill> : null}
            {platformLabel ? (
              <span className="ml-auto">
                <Pill>{platformLabel}</Pill>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/80">
      {children}
    </span>
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

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function scrimStatusLabel(status: ScrimStatus): string {
  switch (status) {
    case "registration_open":
      return "Open";
    case "registration_closed":
      return "Closed";
    case "upcoming":
      return "Upcoming";
    case "ongoing":
      return "Live";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

// Countdown picks the next lifecycle deadline based on status. Returns null
// when the scrim has no future deadline (completed / cancelled / draft).
function relativeCountdown(scrim: Scrim): string | null {
  const now = Date.now();
  let target: number;
  switch (scrim.status) {
    case "upcoming":
      target = new Date(scrim.registration_open_at).getTime();
      break;
    case "registration_open":
      target = new Date(scrim.registration_close_at).getTime();
      break;
    case "registration_closed":
      target = new Date(scrim.starts_at).getTime();
      break;
    case "ongoing":
      target = new Date(scrim.ends_at).getTime();
      break;
    default:
      return null;
  }
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

function orgInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
