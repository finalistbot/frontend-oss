"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  isApiError,
  useRedeemTeamInvite,
  useTeamInvitePreview,
} from "@repo/api";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Crown, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";

export default function JoinTeamByInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const preview = useTeamInvitePreview(token, { enabled: Boolean(token) });
  const redeem = useRedeemTeamInvite();

  if (!token) notFound();

  function join() {
    redeem.mutate(token, {
      onSuccess: (result) => router.push(`/play/teams/${result.team_id}`),
    });
  }

  return (
    <>
      <PageHeader
        title="Join team"
        description="Preview the invite, then join the team using this link."
        back={{ href: "/play/teams", label: "All teams" }}
      />

      <section className="mx-auto grid w-full max-w-2xl gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Invite details
            </CardTitle>
            <CardDescription>
              The team captain controls this invite link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview.isLoading ? (
              <p className="text-sm text-muted-foreground">Checking invite...</p>
            ) : preview.error ? (
              <InviteError error={preview.error} />
            ) : preview.data ? (
              <>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Team
                  </div>
                  <div className="mt-1 text-2xl font-black uppercase text-foreground">
                    {preview.data.team_name}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Crown className="size-4 text-yellow-500" />
                    Captain #{preview.data.captain_id}
                    <Badge variant="outline">{preview.data.invite.join_type}</Badge>
                  </div>
                </div>

                {redeem.error ? <InviteError error={redeem.error} /> : null}

                <div className="flex flex-wrap gap-2">
                  <Button disabled={redeem.isPending} onClick={join}>
                    {redeem.isPending ? "Joining..." : "Join team"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/play/teams">View teams</Link>
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function InviteError({ error }: { error: unknown }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {isApiError(error) ? error.message : "This invite link is not available."}
    </div>
  );
}
