"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Archive } from "lucide-react";
import { useMyOrgs, useScrims } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import { useActiveOrg } from "@/components/layouts/active-org";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";
import {
  ScrimArchiveTable,
  type ScrimArchiveRow,
} from "@/features/scrims";

export default function ManageScrimArchivePage() {
  const { activeOrgId } = useActiveOrg();
  // Backend list endpoint takes a single status filter; fetch both archived
  // states in parallel and merge by ends_at descending.
  const completedQuery = useScrims({
    status: "completed",
    limit: 100,
    organization_id: activeOrgId ?? undefined,
  });
  const cancelledQuery = useScrims({
    status: "cancelled",
    limit: 100,
    organization_id: activeOrgId ?? undefined,
  });
  const orgs = useMyOrgs({ limit: 50 });
  const isLoading = completedQuery.isLoading || cancelledQuery.isLoading;
  const activeOrgName = orgs.data?.data.find((o) => o.id === activeOrgId)?.name;

  const orgsById = useMemo(() => {
    const map = new Map<number, { name: string; logoUrl?: string }>();
    for (const o of orgs.data?.data ?? []) {
      map.set(o.id, { name: o.name, logoUrl: o.logo_url });
    }
    return map;
  }, [orgs.data?.data]);

  const rows: ScrimArchiveRow[] = useMemo(() => {
    const merged = [
      ...(completedQuery.data?.data ?? []),
      ...(cancelledQuery.data?.data ?? []),
    ].sort(
      (a, b) =>
        new Date(b.ends_at ?? b.updated_at).getTime() -
        new Date(a.ends_at ?? a.updated_at).getTime(),
    );
    return merged.map((scrim) => ({
      scrim,
      href: `/manage/scrims/${scrim.id}`,
      organization:
        typeof scrim.organization_id === "number"
          ? orgsById.get(scrim.organization_id)
          : undefined,
    }));
  }, [completedQuery.data?.data, cancelledQuery.data?.data, orgsById]);

  return (
    <>
      <PageHeader
        title="Scrim archive"
        description={
          activeOrgName
            ? `Completed scrims hosted by ${activeOrgName}.`
            : "All completed scrims across your organizations."
        }
        action={
          <Button asChild variant="outline">
            <Link href="/manage/scrims">Back to scrims</Link>
          </Button>
        }
      />
      <PageBody>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Archive className="size-10" />}
            title="No archived scrims"
            description="Completed scrims will land here once a match is ended."
          />
        ) : (
          <ScrimArchiveTable rows={rows} />
        )}
      </PageBody>
    </>
  );
}
