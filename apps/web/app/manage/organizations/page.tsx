"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useMyOrgs } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";
import { CreateOrgDialog } from "@/features/manage-organizations/components/create-org-dialog";
import { OrgCard } from "@/features/manage-organizations/components/org-card";

export default function ManageOrganizationsPage() {
  const { data, isLoading } = useMyOrgs({ limit: 50 });
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Workspaces you own or belong to."
        action={
          <Button onClick={() => setCreateOpen(true)} disabled={isLoading}>
            Create organization
          </Button>
        }
      />
      <PageBody>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="size-10" />}
            title="No organizations yet"
            description="Create one to host scrims, manage rosters, and run brackets."
            action={
              <Button onClick={() => setCreateOpen(true)}>Create organization</Button>
            }
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.data.map((o) => (
              <OrgCard
                key={o.id}
                org={o}
                href={`/manage/organizations/${o.id}`}
              />
            ))}
          </section>
        )}
      </PageBody>

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
