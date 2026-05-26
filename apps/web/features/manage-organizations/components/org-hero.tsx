"use client";

import type { Organization } from "@repo/api";

// Hero banner that brands the org page: subtle checkerboard pattern + logo
// (or initial fallback) + the org name and slug. Uses theme tokens only so
// the look stays consistent across light/dark themes.
export function OrgHero({ org }: { org: Organization }) {
  const initial = org.name.trim().charAt(0).toUpperCase() || "?";

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
        {org.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={org.logo_url}
            alt={`${org.name} logo`}
            className="size-20 shrink-0 rounded-2xl border border-border bg-background object-cover md:size-24"
          />
        ) : (
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-border bg-background text-4xl font-black uppercase text-primary md:size-24 md:text-5xl">
            {initial}
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            /o/{org.slug}
          </p>
          <h2 className="truncate text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {org.name}
          </h2>
        </div>
      </div>
    </section>
  );
}
