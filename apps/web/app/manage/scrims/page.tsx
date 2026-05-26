"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import Link from "next/link";
import {
  useGames,
  useMyOrgs,
  useScrims,
  type Platform,
  type Scrim,
} from "@repo/api";
import { Button } from "@repo/ui/components/button";
import { useActiveOrg } from "@/components/layouts/active-org";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";
import { ScrimArchiveBar, ScrimCard } from "@/features/scrims";

export default function ManageScrimsPage() {
  const { activeOrgId } = useActiveOrg();
  const scrimsQuery = useScrims({
    limit: 50,
    organization_id: activeOrgId ?? undefined,
  });
  const games = useGames({ active: true, limit: 100 });
  const orgs = useMyOrgs({ limit: 50 });
  const isLoading = scrimsQuery.isLoading;
  const rows = scrimsQuery.data?.data ?? [];
  const activeOrgName = orgs.data?.data.find((o) => o.id === activeOrgId)?.name;

  const gamesById = useMemo(() => {
    const map = new Map<number, { name: string; platforms: Platform[] }>();
    for (const g of games.data?.data ?? []) {
      map.set(g.id, { name: g.name, platforms: g.platforms });
    }
    return map;
  }, [games.data?.data]);

  const orgsById = useMemo(() => {
    const map = new Map<number, { name: string; logoUrl?: string }>();
    for (const o of orgs.data?.data ?? []) {
      map.set(o.id, { name: o.name, logoUrl: o.logo_url });
    }
    return map;
  }, [orgs.data?.data]);

  const activeScrims = rows.filter(
    (scrim) => scrim.status !== "completed" && scrim.status !== "cancelled",
  );
  const archivedScrims = rows.filter(
    (scrim) => scrim.status === "completed" || scrim.status === "cancelled",
  );
  const recentArchived = archivedScrims[0];

  return (
    <>
      <PageHeader
        title="Scrims"
        description={
          activeOrgName
            ? `Scrims hosted by ${activeOrgName}.`
            : "All scrims you can host or admin."
        }
        action={
          <Button asChild>
            <Link href="/manage/scrims/new">Create scrim</Link>
          </Button>
        }
      />
      <PageBody>
        <ScrimArchiveBar
          href="/manage/scrims/archive"
          totalCount={rows.length}
          archivedCount={archivedScrims.length}
          recent={
            recentArchived
              ? {
                  name: recentArchived.name,
                  meta: scrimRecentMeta(recentArchived),
                }
              : undefined
          }
        />

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : activeScrims.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-10" />}
            title={
              activeOrgName ? `No scrims for ${activeOrgName}` : "No scrims yet"
            }
            description="Create your first scrim or set up a recurring preset to auto-generate them."
            action={
              <Button asChild variant="outline">
                <Link href="/manage/presets">Browse presets</Link>
              </Button>
            }
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeScrims.map((scrim) => {
              const game = gamesById.get(scrim.game_id);
              const organization =
                typeof scrim.organization_id === "number"
                  ? orgsById.get(scrim.organization_id)
                  : undefined;
              return (
                <ScrimCard
                  key={scrim.id}
                  scrim={scrim}
                  href={`/manage/scrims/${scrim.id}`}
                  gameName={game?.name}
                  platformLabel={platformLabel(game?.platforms?.[0])}
                  organization={organization}
                />
              );
            })}
          </section>
        )}
      </PageBody>
    </>
  );
}

function platformLabel(p: Platform | undefined): string | undefined {
  switch (p) {
    case "pc":
      return "PC";
    case "mobile":
      return "Mobile";
    case "console":
      return "Console";
    case "cross_platform":
      return "Cross-platform";
    default:
      return undefined;
  }
}

function scrimRecentMeta(scrim: Scrim) {
  const date = new Date(scrim.starts_at);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return sameDay
    ? `Today at ${time}`
    : `${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })} · ${time}`;
}
