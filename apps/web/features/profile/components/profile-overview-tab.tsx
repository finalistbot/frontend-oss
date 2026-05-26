"use client";

import type { ReactNode } from "react";
import { useGameIdentities } from "@repo/api";
import type { AuthUser } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { BadgeCheck, Gamepad2, ShieldAlert } from "lucide-react";

interface ProfileOverviewTabProps {
  user: AuthUser;
  onManageIdentities: () => void;
}

export function ProfileOverviewTab({
  user,
  onManageIdentities,
}: ProfileOverviewTabProps) {
  const identities = useGameIdentities();
  const identityCount = identities.data?.length ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase tracking-tight">
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <DetailRow label="Username" value={user.username || "Not set"} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow
            label="Email status"
            value={
              user.email_verified ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <BadgeCheck className="size-4" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-4" />
                  Unverified
                </span>
              )
            }
          />
          <DetailRow label="User ID" value={`#${user.id}`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase tracking-tight">
            Game identities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Gamepad2 className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-black uppercase tracking-tight text-foreground">
                {identities.isLoading ? "—" : identityCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {identityCount === 1 ? "game configured" : "games configured"}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Captains see these in-game names on scrim slot lists.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={onManageIdentities}
          >
            Manage identities
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}
