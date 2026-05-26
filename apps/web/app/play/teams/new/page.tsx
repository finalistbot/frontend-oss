"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isApiError, useCreateTeam, useMyTeams } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Crown, ShieldPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";

export default function CreatePlayTeamPage() {
  const router = useRouter();
  const createTeam = useCreateTeam();
  const myTeams = useMyTeams({ limit: 20 });
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length >= 2 && !createTeam.isPending;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    createTeam.mutate(
      { name: name.trim() },
      {
        onSuccess: (team) => router.push(`/play/teams/${team.id}`),
        onError: (err) =>
          setError(isApiError(err) ? err.message : "Failed to create team."),
      },
    );
  }

  return (
    <>
      <PageHeader
        title="Create team"
        description="Creating a team makes you the captain. Use it to register scrim-specific player and substitute lineups."
        back={{ href: "/play/teams", label: "All teams" }}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldPlus className="size-5" />
              New team
            </CardTitle>
            <CardDescription>
              Pick a name now. A join code is generated automatically after creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Team name</span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Example: Red Eagles"
                  minLength={2}
                  required
                />
              </label>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={!canSubmit}>
                  {createTeam.isPending ? "Creating..." : "Create team"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/play/scrims">Back to scrims</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Your teams
            </CardTitle>
            <CardDescription>
              Teams where you are captain can register for public scrims.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {myTeams.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading teams...</p>
            ) : !myTeams.data || myTeams.data.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teams yet.</p>
            ) : (
              myTeams.data.data.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {team.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code {team.team_code}
                    </div>
                  </div>
                  <Crown className="size-4 text-yellow-500" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
