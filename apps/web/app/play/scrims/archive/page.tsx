"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Archive } from "lucide-react";
import { useScrims } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import {
  ScrimArchiveTable,
  type ScrimArchiveRow,
} from "@/features/scrims";

export default function PlayScrimArchivePage() {
  const completedQuery = useScrims({ status: "completed", limit: 100 });
  const cancelledQuery = useScrims({ status: "cancelled", limit: 100 });
  const isLoading = completedQuery.isLoading || cancelledQuery.isLoading;

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
      href: `/play/scrims/${scrim.id}`,
    }));
  }, [completedQuery.data?.data, cancelledQuery.data?.data]);

  return (
    <>
      <PageHeader
        title="Scrim archive"
        description="All scrims that have finished. Open one to see the final lineup and result."
        action={
          <Button asChild variant="outline">
            <Link href="/play/scrims">Back to scrims</Link>
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading archive...</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Archive className="size-10" />}
          title="Archive is empty"
          description="Scrims you've played will show up here once they wrap."
        />
      ) : (
        <ScrimArchiveTable rows={rows} />
      )}
    </>
  );
}
