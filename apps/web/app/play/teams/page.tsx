"use client";

import Link from "next/link";
import { useMyTeams } from "@repo/api";
import { useAuth } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { Plus, Users } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import { TeamCard } from "@/features/play-teams/components/team-card";

export default function PlayTeamsPage() {
  const { user } = useAuth();
  const teams = useMyTeams({ limit: 50 });
  const rows = teams.data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Teams"
        description="Create teams, review rosters, handle pending requests, and generate invite links."
        action={
          <Button asChild>
            <Link href="/play/teams/new">
              <Plus className="size-4" />
              Create team
            </Link>
          </Button>
        }
      />

      {teams.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading teams...</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Users className="size-10" />}
          title="No teams yet"
          description="Create a team to become captain and register for scrims."
          action={
            <Button asChild>
              <Link href="/play/teams/new">Create team</Link>
            </Button>
          }
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              href={`/play/teams/${team.id}`}
              isCaptain={team.captain_id === user?.id}
            />
          ))}
        </section>
      )}
    </>
  );
}
