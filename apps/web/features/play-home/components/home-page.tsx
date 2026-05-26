"use client";

import Link from "next/link";
import { useAuth } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { PageHeader } from "@/components/layouts/page-header";

export function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={<>Welcome back, {user?.username || "player"}.</>}
        description="Browse scrims, manage your teams, and track registrations from here."
        action={
          <>
            <Button asChild>
              <Link href="/play/scrims">Browse scrims</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/play/teams/new">Create team</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        <Stat label="Email" value={user?.email ?? "Unavailable"} />
        <Stat label="Username" value={user?.username || "Pending setup"} />
        <Stat label="Account ID" value={user ? `#${user.id}` : "Unavailable"} />
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="truncate text-lg font-semibold text-foreground">{value}</div>
    </article>
  );
}
