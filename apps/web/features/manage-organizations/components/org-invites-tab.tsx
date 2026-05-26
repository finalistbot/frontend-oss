"use client";

import { useState } from "react";
import { isApiError, useCancelOrgInvite, useOrgInvites } from "@repo/api";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { userLabel } from "@/lib/user-label";
import { InviteMemberDialog } from "./invite-member-dialog";
import type { OrgRoleResult } from "../use-org-role";

interface OrgInvitesTabProps {
  orgId: number;
  callerRole: OrgRoleResult;
}

export function OrgInvitesTab({ orgId, callerRole }: OrgInvitesTabProps) {
  const { data, isLoading } = useOrgInvites(orgId, { limit: 50 });
  const cancel = useCancelOrgInvite();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancelInvite(id: number) {
    setError(null);
    cancel.mutate(id, {
      onError: (err) =>
        setError(isApiError(err) ? err.message : "Failed to cancel invite."),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        {callerRole.isAdmin ? (
          <Button onClick={() => setInviteOpen(true)}>Invite member</Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !data || data.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invites yet.</p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border">
          {data.data.map((invite, idx) => (
            <li
              key={invite.id}
              className={`flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3 text-sm text-card-foreground ${
                idx > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {userLabel(invite.user_id, invite.username)}
                  </span>
                  <Badge variant="outline">{invite.role}</Badge>
                  <Badge variant="secondary">{invite.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  #{invite.user_id} · Expires{" "}
                  {new Date(invite.expires_at).toLocaleString()}
                </p>
              </div>

              {callerRole.isAdmin && invite.status === "pending" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => cancelInvite(invite.id)}
                  disabled={cancel.isPending}
                >
                  Cancel
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <InviteMemberDialog
        orgId={orgId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}
