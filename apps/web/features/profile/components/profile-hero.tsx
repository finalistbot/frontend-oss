"use client";

import type { AuthUser } from "@repo/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { BadgeCheck, ShieldAlert, Swords } from "lucide-react";

// Two-letter initials for the avatar fallback. Splits on common separators.
function initials(value: string) {
  const segments = value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "");
  return segments.join("") || value.slice(0, 2).toUpperCase();
}

// Hero banner that brands the profile page: subtle checkerboard pattern +
// avatar + username + verification badge, with a scrims-played stat tile on
// the trailing edge. Uses theme tokens only so it tracks light/dark.
export function ProfileHero({
  user,
  scrimsPlayed,
}: {
  user: AuthUser;
  scrimsPlayed: number;
}) {
  const displayName = user.username || user.email.split("@")[0] || "Player";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(45deg, var(--color-muted) 25%, transparent 25%), linear-gradient(-45deg, var(--color-muted) 25%, transparent 25%)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-primary/15 to-transparent"
      />

      <div className="relative flex flex-wrap items-center gap-6 p-6 md:p-10">
        <Avatar className="size-20 shrink-0 border border-border bg-background md:size-24">
          {user.avatar_url ? <AvatarImage src={user.avatar_url} alt="" /> : null}
          <AvatarFallback className="rounded-none text-3xl font-black uppercase text-primary md:text-4xl">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-2">
          <h2 className="truncate text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {displayName}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {user.email_verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="size-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                <ShieldAlert className="size-3.5" />
                Email unverified
              </span>
            )}
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
              #{user.id}
            </span>
          </div>
        </div>

        <div className="ml-auto rounded-2xl border border-border bg-background px-6 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Swords className="size-3.5" />
            Scrims played
          </div>
          <div className="mt-1 text-3xl font-black uppercase tracking-tight text-foreground">
            {scrimsPlayed}
          </div>
        </div>
      </div>
    </section>
  );
}
