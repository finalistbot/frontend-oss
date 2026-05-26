"use client";

import { ListTree } from "lucide-react";
import Link from "next/link";
import { usePresets } from "@repo/api";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";

export default function ManagePresetsPage() {
  const { data, isLoading } = usePresets({ limit: 50 });

  return (
    <>
      <PageHeader
        title="Presets"
        description="Recurring scrim templates that auto-generate scrims on schedule."
        action={
          <Button asChild>
            <Link href="/manage/presets/new">Create preset</Link>
          </Button>
        }
      />
      <PageBody>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={<ListTree className="size-10" />}
            title="No presets yet"
            description="Presets generate scrims daily or weekly using your map rotation + filter rules."
          />
        ) : (
          <ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
            {data.data.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/manage/presets/${p.id}`}
                  className="block rounded-2xl border border-border bg-card p-4 text-card-foreground transition-colors hover:border-primary/40"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">{p.name}</h2>
                    <Badge variant="outline">{p.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.recurrence_type} · {p.scrim_start_time} · {p.timezone || "UTC"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageBody>
    </>
  );
}
