"use client";

import { ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";
import { useMyOrgs, useScrims } from "@repo/api";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { useActiveOrg } from "@/components/layouts/active-org";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";

export function HomePage() {
  const { activeOrgId } = useActiveOrg();
  const orgs = useMyOrgs({ limit: 5 });
  const scrims = useScrims({ limit: 5, organization_id: activeOrgId ?? undefined });

  const orgCount = orgs.data?.pagination.total ?? 0;
  const isOrganizer = orgCount > 0;

  if (orgs.isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <PageBody>
          <div className="text-sm text-muted-foreground">Loading workspace...</div>
        </PageBody>
      </>
    );
  }

  if (!isOrganizer) {
    return (
      <>
        <PageHeader
          title="Become an organizer"
          description="Create an organization to host scrims, manage rosters, and run brackets."
        />
        <PageBody>
          <EmptyState
            icon={<ShieldCheck className="size-10" />}
            title="You're not in any organization yet"
            description="Organizations own scrims, presets, and ban lists. Create one or accept an invite to get started."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild>
                  <Link href="/manage/organizations">Create organization</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/manage/inbox">Check invites</Link>
                </Button>
              </div>
            }
          />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Quick view of your workspace."
        action={
          <Button asChild>
            <Link href="/manage/scrims/new">Create scrim</Link>
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <Stat
            label="Organizations"
            value={orgCount}
            icon={<ShieldCheck className="size-4" />}
            href="/manage/organizations"
          />
          <Stat
            label="Active scrims"
            value={scrims.data?.pagination.total ?? 0}
            icon={<Trophy className="size-4" />}
            href="/manage/scrims"
          />
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card title="Your organizations" href="/manage/organizations">
            {orgs.data && orgs.data.data.length > 0 ? (
              <ul className="divide-y divide-border">
                {orgs.data.data.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">{o.name}</span>
                    <Badge variant="outline">{o.slug}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No organizations yet.</div>
            )}
          </Card>

          <Card title="Recent scrims" href="/manage/scrims">
            {scrims.data && scrims.data.data.length > 0 ? (
              <ul className="divide-y divide-border">
                {scrims.data.data.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">{s.name}</span>
                    <Badge variant="outline">{s.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No scrims yet.</div>
            )}
          </Card>
        </section>
      </PageBody>
    </>
  );
}

function Stat({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-5 text-card-foreground transition-colors hover:border-primary/40"
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {icon} {label}
      </div>
      <div className="text-3xl font-semibold text-foreground">{value}</div>
    </Link>
  );
}

function Card({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <Link
          href={href}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View all →
        </Link>
      </header>
      {children}
    </article>
  );
}
