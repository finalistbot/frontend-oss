"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import {
  isApiError,
  useOrg,
  useOrgInvites,
  useOrgMembers,
  useOrgPlayerBans,
  useOrgTeamBans,
  useScrims,
} from "@repo/api";
import { Button } from "@repo/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";
import { CreateOrgDialog } from "@/features/manage-organizations/components/create-org-dialog";
import { OrgHero } from "@/features/manage-organizations/components/org-hero";
import { OrgInvitesTab } from "@/features/manage-organizations/components/org-invites-tab";
import { OrgMembersTab } from "@/features/manage-organizations/components/org-members-tab";
import { OrgPlayerBansTab } from "@/features/manage-organizations/components/org-player-bans-tab";
import { OrgSettingsTab } from "@/features/manage-organizations/components/org-settings-tab";
import { OrgTeamBansTab } from "@/features/manage-organizations/components/org-team-bans-tab";
import { useOrgRole } from "@/features/manage-organizations/use-org-role";

export default function OrgDetailPage() {
  const params = useParams<{ id: string }>();
  const orgId = Number.parseInt(params.id, 10);
  const isValidId = Number.isFinite(orgId) && orgId > 0;

  const orgQuery = useOrg(orgId, { enabled: isValidId });
  const callerRole = useOrgRole(isValidId ? orgId : 0);
  const members = useOrgMembers(orgId, { enabled: isValidId });
  const invites = useOrgInvites(orgId, { limit: 1 }, { enabled: isValidId });
  const teamBans = useOrgTeamBans(orgId, { limit: 1 }, { enabled: isValidId });
  const playerBans = useOrgPlayerBans(orgId, { limit: 1 }, { enabled: isValidId });
  const scrims = useScrims({ organization_id: isValidId ? orgId : undefined, limit: 1 });
  const [createOpen, setCreateOpen] = useState(false);

  if (!isValidId) notFound();

  if (orgQuery.isLoading || callerRole.isLoading) {
    return (
      <>
        <PageHeader title="Organization" />
        <PageBody>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </PageBody>
      </>
    );
  }

  if (orgQuery.error) {
    if (isApiError(orgQuery.error) && orgQuery.error.code === "org_not_found") {
      notFound();
    }
    return (
      <>
        <PageHeader title="Organization" />
        <PageBody>
          <p className="text-sm text-destructive">
            {isApiError(orgQuery.error)
              ? orgQuery.error.message
              : "Failed to load organization."}
          </p>
        </PageBody>
      </>
    );
  }

  const org = orgQuery.data;
  if (!org) return null;

  // Caller has no membership row → they can't view internals. Surface a
  // friendly redirect rather than letting tabs fetch and 403.
  if (callerRole.role === null) {
    return (
      <>
        <PageHeader
          title={org.name}
          description={`/o/${org.slug}`}
          back={{ href: "/manage/organizations", label: "All organizations" }}
        />
        <PageBody>
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-card-foreground">
            <p className="text-sm text-muted-foreground">
              You&apos;re not a member of this organization.
            </p>
            <Button asChild className="mt-3" variant="outline">
              <Link href="/manage/organizations">Back to organizations</Link>
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  const memberCount = members.data?.length ?? 0;
  const pendingInviteCount = invites.data?.pagination.total ?? 0;
  const teamBanCount = teamBans.data?.pagination.total ?? 0;
  const playerBanCount = playerBans.data?.pagination.total ?? 0;
  const scrimCount = scrims.data?.pagination.total ?? 0;

  const subtitle =
    `/o/${org.slug} · ${memberCount} ${memberCount === 1 ? "member" : "members"}` +
    ` · ${scrimCount} ${scrimCount === 1 ? "scrim" : "scrims"} hosted`;

  return (
    <>
      <PageHeader
        title={org.name}
        description={subtitle}
        back={{ href: "/manage/organizations", label: "All organizations" }}
        action={
          <Button onClick={() => setCreateOpen(true)}>Create organization</Button>
        }
      />

      <PageBody>
        <OrgHero org={org} />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Members" value={memberCount} />
          <StatTile label="Pending invites" value={pendingInviteCount} />
          <StatTile label="Team bans" value={teamBanCount} />
          <StatTile label="Player bans" value={playerBanCount} />
        </section>

        <Tabs defaultValue="members" className="w-full">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="team-bans">Team bans</TabsTrigger>
            <TabsTrigger value="player-bans">Player bans</TabsTrigger>
            {callerRole.isOwner ? (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <OrgMembersTab orgId={org.id} callerRole={callerRole} />
          </TabsContent>
          <TabsContent value="invites" className="mt-6">
            <OrgInvitesTab orgId={org.id} callerRole={callerRole} />
          </TabsContent>
          <TabsContent value="team-bans" className="mt-6">
            <OrgTeamBansTab orgId={org.id} callerRole={callerRole} />
          </TabsContent>
          <TabsContent value="player-bans" className="mt-6">
            <OrgPlayerBansTab orgId={org.id} callerRole={callerRole} />
          </TabsContent>
          {callerRole.isOwner ? (
            <TabsContent value="settings" className="mt-6">
              <OrgSettingsTab org={org} isOwner />
            </TabsContent>
          ) : null}
        </Tabs>
      </PageBody>

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <div className="text-4xl font-black uppercase tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
