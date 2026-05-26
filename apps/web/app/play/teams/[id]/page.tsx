"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import {
  isApiError,
  useAcceptJoinRequest,
  useCreateTeamInvite,
  useDeclineJoinRequest,
  useIncomingJoinRequests,
  useKickTeamMember,
  useRevokeTeamInvite,
  useTeam,
  useTeamInvites,
  useTeamMembers,
  useTeamRealtime,
  type Team,
  type TeamInvite,
  type TeamJoinRequest,
  type TeamMember,
} from "@repo/api";
import { useAuth } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Check, Copy, Crown, Hash, Link2, MoreVertical, UserRound, Users } from "lucide-react";
import { appConfig } from "@/config";
import { PageHeader } from "@/components/layouts/page-header";
import { userLabel } from "@/lib/user-label";

export default function PlayTeamDetailPage() {
  const params = useParams<{ id: string }>();
  const teamId = Number.parseInt(params.id, 10);
  const isValidId = Number.isFinite(teamId) && teamId > 0;
  const teamQuery = useTeam(teamId, { enabled: isValidId });

  if (!isValidId) notFound();

  if (teamQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading team...</p>;
  }

  if (teamQuery.error) {
    if (isApiError(teamQuery.error) && teamQuery.error.code === "team_not_found") {
      notFound();
    }
    return (
      <p className="text-sm text-destructive">
        {isApiError(teamQuery.error) ? teamQuery.error.message : "Failed to load team."}
      </p>
    );
  }

  if (!teamQuery.data) return null;

  return <TeamDetail team={teamQuery.data} />;
}

function TeamDetail({ team }: { team: Team }) {
  const { user } = useAuth();
  const isCaptain = team.captain_id === user?.id;
  const members = useTeamMembers(team.id);
  const requests = useIncomingJoinRequests(team.id, { enabled: isCaptain });
  const invites = useTeamInvites(team.id, { enabled: isCaptain });
  const [inviteOpen, setInviteOpen] = useState(false);

  useTeamRealtime(team.id, appConfig.apiBaseUrl);

  const rows = members.data ?? [];
  const captainMember = rows.find((m) => m.participant_id === team.captain_id);
  const captainLabel = userLabel(
    team.captain_id,
    captainMember?.username,
    team.captain_id === user?.id ? user?.username || "You" : null,
  );

  return (
    <>
      <PageHeader
        title={team.name}
        description="Manage your team and roster."
        back={{ href: "/play/teams", label: "All teams" }}
        action={
          isCaptain ? (
            <Button onClick={() => setInviteOpen(true)}>Create invite link</Button>
          ) : null
        }
      />

      <section className="grid gap-3 md:grid-cols-3">
        <TeamStat
          icon={<Crown className="size-4 text-yellow-500" />}
          label="Captain"
          value={captainLabel}
        />
        <TeamStat
          icon={<Users className="size-4 text-muted-foreground" />}
          label="Members"
          value={rows.length}
        />
        <TeamStat
          icon={<Hash className="size-4 text-muted-foreground" />}
          label="Team code"
          value={team.team_code}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MembersPanel
          team={team}
          members={rows}
          isLoading={members.isLoading}
          isCaptain={isCaptain}
          currentUserId={user?.id}
        />
        {isCaptain ? (
          <div className="grid gap-4">
            <RequestsPanel
              teamId={team.id}
              requests={requests.data ?? []}
              isLoading={requests.isLoading}
            />
            <InvitesPanel
              teamId={team.id}
              invites={invites.data ?? []}
              isLoading={invites.isLoading}
            />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight">
                Captain controls
              </CardTitle>
              <CardDescription>
                Only the captain can invite players, accept requests, or change the roster.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>

      <CreateInviteDialog
        teamId={team.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </>
  );
}

function MembersPanel({
  team,
  members,
  isLoading,
  isCaptain,
  currentUserId,
}: {
  team: Team;
  members: TeamMember[];
  isLoading: boolean;
  isCaptain: boolean;
  currentUserId?: number;
}) {
  const kick = useKickTeamMember(team.id);
  const [error, setError] = useState<string | null>(null);

  function removeMember(memberId: number) {
    setError(null);
    kick.mutate(memberId, {
      onError: (err) =>
        setError(isApiError(err) ? err.message : "Failed to remove member."),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-black uppercase tracking-tight">
          Members
        </CardTitle>
        <CardDescription>Current independent team roster.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading members...</p>
        ) : (
          members.map((member) => {
            const captain = member.participant_id === team.captain_id;
            const self = member.participant_id === currentUserId;
            const displayName = userLabel(
              member.participant_id,
              member.username,
              self ? "You" : null,
            );
            return (
              <TeamPersonRow
                key={member.participant_id}
                title={displayName}
                subtitle={`${captain ? "Captain" : "Member"} · #${member.participant_id} · Joined ${new Date(member.joined_at).toLocaleDateString()}`}
                marker={captain ? <Crown className="size-4 text-yellow-500" /> : null}
                action={
                  isCaptain && !captain ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={kick.isPending}
                      onClick={() => removeMember(member.participant_id)}
                    >
                      Remove
                    </Button>
                  ) : (
                    <MoreVertical className="size-4 text-muted-foreground" />
                  )
                }
              />
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function RequestsPanel({
  teamId,
  requests,
  isLoading,
}: {
  teamId: number;
  requests: TeamJoinRequest[];
  isLoading: boolean;
}) {
  const accept = useAcceptJoinRequest(teamId);
  const decline = useDeclineJoinRequest(teamId);
  const pending = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-black uppercase tracking-tight">
          Pending requests
        </CardTitle>
        <CardDescription>Accept or decline users asking to join.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          pending.map((request) => (
            <TeamPersonRow
              key={request.id}
              title={userLabel(request.user_id, request.username)}
              subtitle={`#${request.user_id} · ${request.join_type} request · expires ${new Date(request.expires_at).toLocaleDateString()}`}
              action={
                <div className="flex gap-1">
                  <Button
                    size="xs"
                    disabled={accept.isPending || decline.isPending}
                    onClick={() => accept.mutate(request.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    disabled={accept.isPending || decline.isPending}
                    onClick={() => decline.mutate(request.id)}
                  >
                    Decline
                  </Button>
                </div>
              }
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function InvitesPanel({
  teamId,
  invites,
  isLoading,
}: {
  teamId: number;
  invites: TeamInvite[];
  isLoading: boolean;
}) {
  const revoke = useRevokeTeamInvite(teamId);
  const active = invites.filter((invite) => !invite.revoked_at);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-black uppercase tracking-tight">
          Invites
        </CardTitle>
        <CardDescription>Active captain-issued invite tokens.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading invites...</p>
        ) : active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active invites.</p>
        ) : (
          active.map((invite) => {
            const url = inviteUrl(invite.token);
            return (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {invite.join_type} invite
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{url}</div>
                </div>
                <div className="flex gap-1">
                  <CopyButton value={url} />
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate(invite.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function CreateInviteDialog({
  teamId,
  open,
  onOpenChange,
}: {
  teamId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createInvite = useCreateTeamInvite(teamId);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function create() {
    setError(null);
    createInvite.mutate(
      { join_type: "member" },
      {
        onSuccess: (result) => {
          setCreatedUrl(normalizeInviteUrl(result.url));
        },
        onError: (err) =>
          setError(isApiError(err) ? err.message : "Failed to create invite."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create invite link</DialogTitle>
          <DialogDescription>
            Anyone who redeems this link joins as a team member. The captain decides who
            plays or substitutes at scrim registration time.
          </DialogDescription>
        </DialogHeader>

        {createdUrl ? (
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Link2 className="size-4" />
              Invite link
            </div>
            <div className="break-all text-sm text-muted-foreground">{createdUrl}</div>
            <CopyButton className="mt-3" value={createdUrl} />
          </div>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={createInvite.isPending} onClick={create}>
            {createInvite.isPending ? "Creating..." : "Create link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button size="sm" variant="outline" className={className} onClick={copy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function inviteUrl(token: string) {
  return `${appConfig.appUrl.replace(/\/$/, "")}/play/teams/join/${token}`;
}

function normalizeInviteUrl(value: string) {
  try {
    const url = new URL(value);
    const token = url.pathname.split("/").filter(Boolean).at(-1);
    return token ? inviteUrl(token) : value;
  } catch {
    return value;
  }
}

function TeamPersonRow({
  title,
  subtitle,
  marker,
  action,
}: {
  title: string;
  subtitle: string;
  marker?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <UserRound className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
            {title}
            {marker}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function TeamStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
