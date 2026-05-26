"use client";

import { useState } from "react";
import { isApiError, useOrgTeamBans, useUnbanOrgTeam } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { ShieldOff } from "lucide-react";
import type { OrgRoleResult } from "../use-org-role";
import { BanTeamDialog } from "./ban-team-dialog";

interface OrgTeamBansTabProps {
  orgId: number;
  callerRole: OrgRoleResult;
}

export function OrgTeamBansTab({ orgId, callerRole }: OrgTeamBansTabProps) {
  const { data, isLoading } = useOrgTeamBans(orgId, { limit: 50 });
  const unban = useUnbanOrgTeam(orgId);
  const [error, setError] = useState<string | null>(null);
  const [banOpen, setBanOpen] = useState(false);

  function lift(teamId: number) {
    setError(null);
    unban.mutate(teamId, {
      onError: (err) =>
        setError(isApiError(err) ? err.message : "Failed to lift ban."),
    });
  }

  const rows = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-xl font-black uppercase tracking-tight">
          Team bans
        </CardTitle>
        {callerRole.isAdmin ? (
          <Button size="sm" onClick={() => setBanOpen(true)}>
            <ShieldOff className="size-4" />
            Ban team
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading team bans...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No teams are currently banned from this organization.
          </p>
        ) : (
          rows.map((ban) => (
            <div
              key={ban.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <ShieldOff className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    Team #{ban.team_id}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {ban.reason || "No reason recorded"} · banned{" "}
                    {new Date(ban.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {callerRole.isAdmin ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => lift(ban.team_id)}
                  disabled={unban.isPending}
                >
                  Lift ban
                </Button>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
      <BanTeamDialog orgId={orgId} open={banOpen} onOpenChange={setBanOpen} />
    </Card>
  );
}
