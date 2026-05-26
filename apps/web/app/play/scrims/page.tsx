"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useGames,
  useMyRegistrations,
  useMyTeams,
  useScrims,
  useScrimsListRealtime,
  type Platform,
  type Scrim,
} from "@repo/api";
import { useAuth } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { Trophy } from "lucide-react";
import { appConfig } from "@/config";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import { RegisterLineupDialog } from "@/features/play-scrims";
import { ScrimArchiveBar, ScrimCard } from "@/features/scrims";

export default function PlayScrimsPage() {
  const { user } = useAuth();
  const scrimsQuery = useScrims({ limit: 50 });
  const teams = useMyTeams({ limit: 50 });
  const myRegistrations = useMyRegistrations();
  const games = useGames({ active: true, limit: 100 });
  const [selectedScrim, setSelectedScrim] = useState<Scrim | null>(null);

  // Subscribe to every listed scrim so a host opening/closing registration (or
  // any status change) refreshes the card grid live — the per-scrim detail
  // hook isn't mounted here.
  const scrimIds = useMemo(
    () => (scrimsQuery.data?.data ?? []).map((scrim) => scrim.id),
    [scrimsQuery.data?.data],
  );
  useScrimsListRealtime(scrimIds, appConfig.apiBaseUrl);

  const captainTeams = useMemo(
    () => (teams.data?.data ?? []).filter((team) => team.captain_id === user?.id),
    [teams.data?.data, user?.id],
  );

  const registeredScrimIds = useMemo(
    () => new Set((myRegistrations.data ?? []).map((reg) => reg.scrim_id)),
    [myRegistrations.data],
  );

  const gamesById = useMemo(() => {
    const map = new Map<number, { name: string; platforms: Platform[] }>();
    for (const g of games.data?.data ?? []) {
      map.set(g.id, { name: g.name, platforms: g.platforms });
    }
    return map;
  }, [games.data?.data]);

  // Drafts are unpublished — only the hosting org may see them. Drop them
  // before anything player-facing (cards, counts, the archive bar) is derived.
  const scrimRows = (scrimsQuery.data?.data ?? []).filter(
    (scrim) => scrim.status !== "draft",
  );
  const activeScrims = scrimRows.filter(
    (scrim) =>
      scrim.status !== "completed" && scrim.status !== "cancelled",
  );
  const archivedScrims = scrimRows.filter(
    (scrim) => scrim.status === "completed" || scrim.status === "cancelled",
  );
  const recentArchived = archivedScrims[0];

  return (
    <>
      <PageHeader
        title="Scrims"
        description="Captains register an independent lineup for each scrim. Players and substitutes here apply only to this scrim."
        action={
          <Button asChild>
            <Link href="/play/teams/new">Create team</Link>
          </Button>
        }
      />

      <ScrimArchiveBar
        href="/play/scrims/archive"
        totalCount={scrimRows.length}
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

      {scrimsQuery.isLoading || teams.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading scrims...</p>
      ) : activeScrims.length === 0 ? (
        <EmptyState
          icon={<Trophy className="size-10" />}
          title="No scrims yet"
          description="Scrims will appear here once a host opens registration."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeScrims.map((scrim) => {
            const game = gamesById.get(scrim.game_id);
            const registered = registeredScrimIds.has(scrim.id);
            const isOpen = scrim.status === "registration_open";
            const canRegister = captainTeams.length > 0;
            return (
              <ScrimCard
                key={scrim.id}
                scrim={scrim}
                href={`/play/scrims/${scrim.id}`}
                gameName={game?.name}
                platformLabel={platformLabel(game?.platforms?.[0])}
                action={
                  <RegisterAction
                    registered={registered}
                    isOpen={isOpen}
                    canRegister={canRegister}
                    onRegister={() => setSelectedScrim(scrim)}
                  />
                }
              />
            );
          })}
        </section>
      )}

      <RegisterLineupDialog
        scrim={selectedScrim}
        captainTeams={captainTeams}
        onOpenChange={(open) => {
          if (!open) setSelectedScrim(null);
        }}
      />
    </>
  );
}

function RegisterAction({
  registered,
  isOpen,
  canRegister,
  onRegister,
}: {
  registered: boolean;
  isOpen: boolean;
  canRegister: boolean;
  onRegister: () => void;
}) {
  // stopPropagation/preventDefault so the click doesn't also trigger the
  // card-level Link navigation.
  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onRegister();
  }

  if (registered) {
    return (
      <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        Registered
      </span>
    );
  }
  if (!isOpen) return null;
  if (!canRegister) {
    return (
      <span className="rounded-full border border-border bg-background/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Need a team
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      Register
    </button>
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
