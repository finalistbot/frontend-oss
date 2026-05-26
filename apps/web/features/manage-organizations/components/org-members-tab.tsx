"use client";

import { useState } from "react";
import {
  isApiError,
  useOrgMembers,
  useRemoveOrgMember,
  useUpdateOrgMemberRole,
  type OrgMember,
  type OrgRole,
} from "@repo/api";
import { useAuth } from "@repo/auth";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Crown, Shield, ShieldCheck, UserRound, Users } from "lucide-react";
import { userLabel } from "@/lib/user-label";
import { InviteMemberDialog } from "./invite-member-dialog";
import type { OrgRoleResult } from "../use-org-role";

interface OrgMembersTabProps {
  orgId: number;
  callerRole: OrgRoleResult;
}

export function OrgMembersTab({ orgId, callerRole }: OrgMembersTabProps) {
  const { user } = useAuth();
  const { data: members, isLoading } = useOrgMembers(orgId);
  const updateRole = useUpdateOrgMemberRole(orgId);
  const removeMember = useRemoveOrgMember(orgId);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  function changeRole(userId: number, role: "admin" | "moderator") {
    setError(null);
    updateRole.mutate(
      { userId, body: { role } },
      {
        onError: (err) =>
          setError(isApiError(err) ? err.message : "Failed to update role."),
      },
    );
  }

  function remove(userId: number) {
    setError(null);
    removeMember.mutate(userId, {
      onError: (err) =>
        setError(isApiError(err) ? err.message : "Failed to remove member."),
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl font-black uppercase tracking-tight">
            Members
          </CardTitle>
          {callerRole.isAdmin ? (
            <Button onClick={() => setInviteOpen(true)}>Invite</Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading members...</p>
        ) : !members || members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isSelf={m.user_id === user?.id}
              canEdit={callerRole.isAdmin && m.role !== "owner" && m.user_id !== user?.id}
              onChangeRole={(role) => changeRole(m.user_id, role)}
              onRemove={() => remove(m.user_id)}
              busy={updateRole.isPending || removeMember.isPending}
            />
          ))
        )}
      </CardContent>

      <InviteMemberDialog
        orgId={orgId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </Card>
  );
}

function MemberRow({
  member,
  isSelf,
  canEdit,
  onChangeRole,
  onRemove,
  busy,
}: {
  member: OrgMember;
  isSelf: boolean;
  canEdit: boolean;
  onChangeRole: (role: "admin" | "moderator") => void;
  onRemove: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {userLabel(member.user_id, member.username)}
            </span>
            {isSelf ? <Badge variant="secondary">You</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground">
            #{member.user_id} · Joined{" "}
            {new Date(member.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <RoleIcon role={member.role} />
        {canEdit ? (
          <>
            <Select
              value={member.role === "owner" ? "admin" : member.role}
              onValueChange={(value: "admin" | "moderator") => onChangeRole(value)}
              disabled={busy}
            >
              <SelectTrigger className="h-8 w-32 uppercase text-xs font-bold tracking-[0.12em]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={onRemove} disabled={busy}>
              Remove
            </Button>
          </>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </div>
    </div>
  );
}

function RoleIcon({ role }: { role: OrgRole }) {
  if (role === "owner") {
    return <Crown className="size-4 text-yellow-500" aria-hidden />;
  }
  if (role === "admin") {
    return <ShieldCheck className="size-4 text-emerald-500" aria-hidden />;
  }
  if (role === "moderator") {
    return <Shield className="size-4 text-primary" aria-hidden />;
  }
  return <Users className="size-4 text-muted-foreground" aria-hidden />;
}

function RoleBadge({ role }: { role: OrgRole }) {
  if (role === "owner") return <Badge>Owner</Badge>;
  return (
    <Badge variant="outline" className="uppercase tracking-[0.12em]">
      {role}
    </Badge>
  );
}
