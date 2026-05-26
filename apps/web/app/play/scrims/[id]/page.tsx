"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  isApiError,
  useMyTeams,
  useScrim,
  useScrimRegistrationRealtime,
  useScrimSlots,
  useScrimWaitlist,
  type Scrim,
} from "@repo/api";
import { useAuth } from "@repo/auth";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { RadioTower, Users } from "lucide-react";
import { appConfig } from "@/config";
import { PageHeader } from "@/components/layouts/page-header";
import {
  RegisterLineupDialog,
  ScrimStatusBadge,
  SlotBoard,
  StatCard,
} from "@/features/play-scrims";

export default function PlayScrimDetailPage() {
  const params = useParams<{ id: string }>();
  const scrimId = Number.parseInt(params.id, 10);
  const isValidId = Number.isFinite(scrimId) && scrimId > 0;
  const scrimQuery = useScrim(scrimId, { enabled: isValidId });

  if (!isValidId) notFound();

  if (scrimQuery.isLoading) {
    return (
      <>
        <PageHeader
          title="Scrim"
          back={{ href: "/play/scrims", label: "All scrims" }}
        />
        <p className="text-sm text-muted-foreground">Loading scrim...</p>
      </>
    );
  }

  if (scrimQuery.error) {
    if (isApiError(scrimQuery.error) && scrimQuery.error.code === "scrim_not_found") {
      notFound();
    }
    return (
      <>
        <PageHeader
          title="Scrim"
          back={{ href: "/play/scrims", label: "All scrims" }}
        />
        <p className="text-sm text-destructive">
          {isApiError(scrimQuery.error)
            ? scrimQuery.error.message
            : "Failed to load scrim."}
        </p>
      </>
    );
  }

  if (!scrimQuery.data) return null;

  return <ScrimDetail scrim={scrimQuery.data} />;
}

function ScrimDetail({ scrim }: { scrim: Scrim }) {
  const { user } = useAuth();
  const slotsQuery = useScrimSlots(scrim.id);
  const waitlistQuery = useScrimWaitlist(scrim.id);
  const myTeams = useMyTeams({ limit: 50 });
  const [registerOpen, setRegisterOpen] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);

  useScrimRegistrationRealtime(scrim.id, appConfig.apiBaseUrl, {
    onEvent: () => setLastEventAt(new Date()),
  });

  const slots = slotsQuery.data ?? [];
  const waitlist = waitlistQuery.data ?? [];
  const teamRows = useMemo(() => myTeams.data?.data ?? [], [myTeams.data?.data]);

  const captainTeams = useMemo(
    () => teamRows.filter((team) => team.captain_id === user?.id),
    [teamRows, user?.id],
  );
  const myTeamIds = useMemo(() => teamRows.map((team) => team.id), [teamRows]);
  const myTeamIdSet = useMemo(() => new Set(myTeamIds), [myTeamIds]);

  const filledSlots = slots.filter((slot) => slot.registered_team_id).length;
  const myRegistration =
    slots.find((slot) => slot.team_id && myTeamIdSet.has(slot.team_id)) ??
    waitlist.find((entry) => myTeamIdSet.has(entry.team_id));
  const isOpen = scrim.status === "registration_open";
  const canRegister = isOpen && captainTeams.length > 0 && !myRegistration;

  return (
    <>
      <PageHeader
        title={scrim.name}
        description={scrim.description || "No description provided."}
        back={{ href: "/play/scrims", label: "All scrims" }}
        meta={
          <>
            <ScrimStatusBadge status={scrim.status} />
            <Badge variant="outline" className="capitalize">
              {scrim.visibility}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <RadioTower className="size-3" />
              {lastEventAt ? `Synced ${lastEventAt.toLocaleTimeString()}` : "Live"}
            </Badge>
          </>
        }
        action={
          myRegistration ? (
            <Badge>You are registered</Badge>
          ) : canRegister ? (
            <Button onClick={() => setRegisterOpen(true)}>Register team</Button>
          ) : isOpen && captainTeams.length === 0 ? (
            <Button asChild>
              <Link href="/play/teams/new">Create team</Link>
            </Button>
          ) : null
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Slots filled"
          value={`${filledSlots}/${scrim.max_slots ?? "∞"}`}
        />
        <StatCard label="Waitlist" value={waitlist.length} />
        <StatCard label="Min lineup" value={scrim.min_lineup_size ?? 1} />
        <StatCard label="Max subs" value={scrim.max_substitutes_per_team} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Slot list</h2>
              <p className="text-sm text-muted-foreground">
                Live view of every registered team. Updates in realtime.
              </p>
            </div>
          </header>

          {slotsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading slots...</p>
          ) : (
            <SlotBoard scrim={scrim} slots={slots} myTeamIds={myTeamIds} />
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4" />
                Waitlist
              </CardTitle>
              <CardDescription>
                Teams the host can promote into open slots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {waitlistQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading waitlist...</p>
              ) : waitlist.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teams waiting.</p>
              ) : (
                waitlist.map((entry) => {
                  const isMine = myTeamIdSet.has(entry.team_id);
                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-border bg-background px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {entry.name}
                        </div>
                        {isMine ? <Badge>You</Badge> : null}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {entry.ingame_name}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <ScrimSchedule scrim={scrim} />
        </aside>
      </section>

      <RegisterLineupDialog
        scrim={registerOpen ? scrim : null}
        captainTeams={captainTeams}
        onOpenChange={setRegisterOpen}
      />
    </>
  );
}

function ScrimSchedule({ scrim }: { scrim: Scrim }) {
  const fields: [string, string][] = [
    ["Registration opens", new Date(scrim.registration_open_at).toLocaleString()],
    ["Registration closes", new Date(scrim.registration_close_at).toLocaleString()],
    ["Starts", new Date(scrim.starts_at).toLocaleString()],
    ["Ends", new Date(scrim.ends_at).toLocaleString()],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>All times in your local timezone.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map(([label, value]) => (
          <div key={label} className="space-y-0.5">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </div>
            <div className="text-sm font-medium text-foreground">{value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
