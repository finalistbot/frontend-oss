"use client";

import { useEffect, useState, type DragEvent as ReactDragEvent, type ReactNode } from "react";
import {
  isApiError,
  useRegisterTeam,
  useTeamMembers,
  type LineupRole,
  type Scrim,
  type Team,
} from "@repo/api";
import { useAuth } from "@repo/auth";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Crown, GripVertical, Hash, RotateCcw, UserRound, Users } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { userLabel } from "@/lib/user-label";
import {
  buildRosterMembers,
  type LineupBucket,
  type RosterMember,
} from "../lib/scrim-helpers";

type PickerMode = "player" | "substitute";

interface RegisterLineupDialogProps {
  scrim: Scrim | null;
  captainTeams: Team[];
  onOpenChange: (open: boolean) => void;
}

export function RegisterLineupDialog({
  scrim,
  captainTeams,
  onOpenChange,
}: RegisterLineupDialogProps) {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState<number | null>(null);
  const selectedTeam =
    captainTeams.find((team) => team.id === teamId) ?? captainTeams[0];
  const membersQuery = useTeamMembers(selectedTeam?.id ?? 0, {
    enabled: Boolean(scrim && selectedTeam),
  });
  const register = useRegisterTeam(scrim?.id ?? 0);
  const [teamIgn, setTeamIgn] = useState("");
  const [roles, setRoles] = useState<Record<number, LineupBucket>>({});
  const [draggedUserId, setDraggedUserId] = useState<number | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scrim || !selectedTeam) return;
    setTeamId(selectedTeam.id);
    setTeamIgn(selectedTeam.name);
  }, [scrim, selectedTeam]);

  useEffect(() => {
    if (!selectedTeam || !membersQuery.data) return;
    setRoles(defaultRoles(membersQuery.data, selectedTeam.captain_id));
  }, [membersQuery.data, selectedTeam]);

  if (!scrim) return null;
  const activeScrim = scrim;

  const roster = buildRosterMembers(membersQuery.data ?? [], selectedTeam, user);
  const bench = roster.filter((member) => (roles[member.userId] ?? "out") === "out");
  const players = roster.filter((member) => roles[member.userId] === "player");
  const substitutes = roster.filter(
    (member) => roles[member.userId] === "substitute",
  );
  const pending = register.isPending;
  const minPlayers = activeScrim.min_lineup_size ?? 1;
  const hasTeam = Boolean(selectedTeam);
  const canSubmit =
    hasTeam &&
    players.length >= minPlayers &&
    substitutes.length <= activeScrim.max_substitutes_per_team &&
    teamIgn.trim().length > 0 &&
    !pending;

  function moveMember(userId: number, bucket: LineupBucket) {
    if (selectedTeam && userId === selectedTeam.captain_id && bucket !== "player") {
      return;
    }
    if (bucket === "substitute" && roles[userId] !== "substitute") {
      const currentSubs = Object.values(roles).filter(
        (role) => role === "substitute",
      ).length;
      if (currentSubs >= activeScrim.max_substitutes_per_team) {
        setError(`Only ${activeScrim.max_substitutes_per_team} substitutes allowed.`);
        return;
      }
    }
    setError(null);
    setRoles((current) => ({ ...current, [userId]: bucket }));
  }

  function onDragOver(event: ReactDragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function onDrop(bucket: LineupBucket) {
    if (draggedUserId === null) return;
    moveMember(draggedUserId, bucket);
    setDraggedUserId(null);
  }

  function resetLineup() {
    if (!selectedTeam || !membersQuery.data) return;
    setError(null);
    setRoles(defaultRoles(membersQuery.data, selectedTeam.captain_id));
  }

  function submit() {
    if (!selectedTeam) return;
    setError(null);
    const lineup = roster
      .filter((member) => roles[member.userId] !== "out")
      .map((member) => ({
        user_id: member.userId,
        role: toLineupRole(member, roles[member.userId] ?? "out"),
      }));

    register.mutate(
      {
        team_id: selectedTeam.id,
        ingame_name: teamIgn.trim(),
        lineup,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) =>
          setError(isApiError(err) ? err.message : "Failed to register team."),
      },
    );
  }

  return (
    <Dialog open={Boolean(scrim)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-full overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">
            Register lineup
          </DialogTitle>
          <DialogDescription>
            Build the player and substitute list for {activeScrim.name}. This does not
            change your team membership.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-3">
          <RosterStat
            icon={<Crown className="size-4 text-yellow-500" />}
            label="Captain"
            value={userLabel(
              selectedTeam?.captain_id ?? 0,
              undefined,
              user?.username || null,
            )}
          />
          <RosterStat
            icon={<Users className="size-4 text-muted-foreground" />}
            label="Members"
            value={roster.length}
          />
          <RosterStat
            icon={<Hash className="size-4 text-muted-foreground" />}
            label="Team code"
            value={selectedTeam?.team_code ?? "########"}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Team
            </span>
            <Select
              value={selectedTeam ? String(selectedTeam.id) : ""}
              onValueChange={(value) => setTeamId(Number.parseInt(value, 10))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select captain team" />
              </SelectTrigger>
              <SelectContent>
                {captainTeams.map((team) => (
                  <SelectItem key={team.id} value={String(team.id)}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Scrim IGN
            </span>
            <Input
              value={teamIgn}
              onChange={(event) => setTeamIgn(event.target.value)}
              placeholder="Team display name"
            />
          </label>
        </div>

        {!selectedTeam ? (
          <EmptyState
            title="Captain team required"
            description="Only captains can register teams for scrims."
          />
        ) : membersQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading team roster...</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Lineup
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetLineup}
                disabled={pending}
              >
                <RotateCcw className="size-4" />
                Reset lineup
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <BenchDropZone
                members={bench}
                onDragStart={setDraggedUserId}
                onDragEnd={() => setDraggedUserId(null)}
                onDragOver={onDragOver}
                onDrop={() => onDrop("out")}
                onMove={moveMember}
              />

              <div className="grid gap-4">
                <LineupDropZone
                  title="Players"
                  action="Add player"
                  members={players}
                  empty="Drop players here or use Add player."
                  onOpenPicker={() => setPickerMode("player")}
                  onDragStart={setDraggedUserId}
                  onDragEnd={() => setDraggedUserId(null)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop("player")}
                  onMoveOut={(userId) => moveMember(userId, "out")}
                />
                <LineupDropZone
                  title="Substitutes"
                  action="Add substitute"
                  members={substitutes}
                  empty="Drop substitutes here or use Add substitute."
                  onOpenPicker={() => setPickerMode("substitute")}
                  onDragStart={setDraggedUserId}
                  onDragEnd={() => setDraggedUserId(null)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop("substitute")}
                  onMoveOut={(userId) => moveMember(userId, "out")}
                />
              </div>
            </div>
          </>
        )}

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {pending ? "Registering..." : "Register team"}
          </Button>
        </DialogFooter>

        <MemberPickerDialog
          open={pickerMode !== null}
          mode={pickerMode ?? "player"}
          roster={roster}
          roles={roles}
          maxSubs={activeScrim.max_substitutes_per_team}
          onMove={moveMember}
          onOpenChange={(open) => {
            if (!open) setPickerMode(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function MemberPickerDialog({
  open,
  mode,
  roster,
  roles,
  maxSubs,
  onMove,
  onOpenChange,
}: {
  open: boolean;
  mode: PickerMode;
  roster: RosterMember[];
  roles: Record<number, LineupBucket>;
  maxSubs: number;
  onMove: (userId: number, bucket: LineupBucket) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const target: LineupBucket = mode === "player" ? "player" : "substitute";
  const title = mode === "player" ? "Add player" : "Add substitute";
  const currentSubs = Object.values(roles).filter(
    (role) => role === "substitute",
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription>
            Toggle who is in or out for this scrim lineup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {roster.map((member) => {
            const active = roles[member.userId] === target;
            const subLimitHit =
              target === "substitute" && !active && currentSubs >= maxSubs;
            return (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2"
              >
                <MemberIdentity member={member} />
                {member.isCaptain && target !== "player" ? (
                  <Badge variant="outline">Locked</Badge>
                ) : active ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onMove(member.userId, "out")}
                  >
                    Out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={subLimitHit}
                    onClick={() => onMove(member.userId, target)}
                  >
                    In
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BenchDropZone({
  members,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMove,
}: {
  members: RosterMember[];
  onDragStart: (userId: number) => void;
  onDragEnd: () => void;
  onDragOver: (event: ReactDragEvent) => void;
  onDrop: () => void;
  onMove: (userId: number, bucket: LineupBucket) => void;
}) {
  return (
    <Panel
      title="Bench"
      description="Drag onto Players or Substitutes, or use the Add buttons."
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Everyone is assigned.
        </div>
      ) : (
        members.map((member) => (
          <BenchRow
            key={member.userId}
            member={member}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMove={onMove}
          />
        ))
      )}
    </Panel>
  );
}

function LineupDropZone({
  title,
  action,
  members,
  empty,
  onOpenPicker,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMoveOut,
}: {
  title: string;
  action: string;
  members: RosterMember[];
  empty: string;
  onOpenPicker: () => void;
  onDragStart: (userId: number) => void;
  onDragEnd: () => void;
  onDragOver: (event: ReactDragEvent) => void;
  onDrop: () => void;
  onMoveOut: (userId: number) => void;
}) {
  return (
    <Panel
      title={title}
      action={action}
      onAction={onOpenPicker}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        members.map((member) => (
          <LineupRow
            key={member.userId}
            member={member}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMoveOut={onMoveOut}
          />
        ))
      )}
    </Panel>
  );
}

function Panel({
  title,
  description,
  action,
  children,
  onAction,
  onDragOver,
  onDrop,
}: {
  title: string;
  description?: string;
  action?: string;
  children: ReactNode;
  onAction?: () => void;
  onDragOver: (event: ReactDragEvent) => void;
  onDrop: () => void;
}) {
  return (
    <section
      className="rounded-2xl border border-border bg-card p-4 text-card-foreground"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Button size="sm" onClick={onAction}>
            {action}
          </Button>
        ) : null}
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function BenchRow({
  member,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  member: RosterMember;
  onDragStart: (userId: number) => void;
  onDragEnd: () => void;
  onMove: (userId: number, bucket: LineupBucket) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart(member.userId);
      }}
      onDragEnd={onDragEnd}
      className="flex cursor-grab items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 active:cursor-grabbing"
    >
      <MemberIdentity member={member} />
      {/* Mobile shortcut: drag-and-drop is awkward on touch, so expose
          one-tap "in" toggles. Hidden on md+ where desktop drag is preferred. */}
      <div className="flex gap-1 md:hidden">
        <Button size="sm" onClick={() => onMove(member.userId, "player")}>
          Player
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onMove(member.userId, "substitute")}
        >
          Sub
        </Button>
      </div>
    </div>
  );
}

function LineupRow({
  member,
  onDragStart,
  onDragEnd,
  onMoveOut,
}: {
  member: RosterMember;
  onDragStart: (userId: number) => void;
  onDragEnd: () => void;
  onMoveOut: (userId: number) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart(member.userId);
      }}
      onDragEnd={onDragEnd}
      className="flex cursor-grab items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 active:cursor-grabbing"
    >
      <div className="flex min-w-0 items-center gap-2">
        <GripVertical className="size-4 text-muted-foreground" />
        <MemberIdentity member={member} />
      </div>
      {member.isCaptain ? (
        <Crown className="size-4 text-yellow-500" />
      ) : (
        <Button size="sm" variant="ghost" onClick={() => onMoveOut(member.userId)}>
          Out
        </Button>
      )}
    </div>
  );
}

function MemberIdentity({ member }: { member: RosterMember }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <UserRound className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-foreground">
          {member.label}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">
          {member.subtitle}
        </div>
      </div>
    </div>
  );
}

function RosterStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-card-foreground">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function toLineupRole(member: RosterMember, bucket: LineupBucket): LineupRole {
  if (bucket === "substitute") return "substitute";
  return member.isCaptain ? "captain" : "member";
}

// defaultRoles seeds the role map: captain locked as player, everyone else on
// the bench. Used at first load and by the Reset button.
function defaultRoles(
  members: { participant_id: number }[],
  captainId: number,
): Record<number, LineupBucket> {
  const next: Record<number, LineupBucket> = {};
  for (const member of members) {
    next[member.participant_id] =
      member.participant_id === captainId ? "player" : "out";
  }
  return next;
}
