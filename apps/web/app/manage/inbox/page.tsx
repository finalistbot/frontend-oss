"use client";

import { Inbox } from "lucide-react";
import { useAcceptOrgInvite, useDeclineOrgInvite, useMyOrgInvites } from "@repo/api";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";

export default function ManageInboxPage() {
  const { data, isLoading } = useMyOrgInvites({ limit: 50 });
  const acceptInvite = useAcceptOrgInvite();
  const declineInvite = useDeclineOrgInvite();

  const isPending = (id: number) =>
    (acceptInvite.isPending && acceptInvite.variables === id) ||
    (declineInvite.isPending && declineInvite.variables === id);

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Pending invitations and notifications."
      />
      <PageBody>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-10" />}
            title="No invitations"
            description="Organization owners will appear here when they invite you."
          />
        ) : (
          <ul className="grid gap-3">
            {data.data.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      Organization #{invite.organization_id}
                    </span>
                    <Badge variant="outline">{invite.role}</Badge>
                    <Badge variant="secondary">{invite.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Invited {new Date(invite.created_at).toLocaleString()} · expires{" "}
                    {new Date(invite.expires_at).toLocaleString()}
                  </p>
                </div>
                {invite.status === "pending" ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptInvite.mutate(invite.id)}
                      disabled={isPending(invite.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineInvite.mutate(invite.id)}
                      disabled={isPending(invite.id)}
                    >
                      Decline
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </PageBody>
    </>
  );
}
