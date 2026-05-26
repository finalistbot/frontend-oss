"use client";

import { useMemo } from "react";
import type { Scrim, Slot } from "@repo/api";
import { Badge } from "@repo/ui/components/badge";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotBoardProps {
  scrim: Scrim;
  slots: Slot[];
  myTeamIds?: number[];
}

// Read-only slot board for /play/scrims/[id]. Mirrors the host slot grid in
// /manage/scrims/[id] visually, but without any drag/drop or mutations.
export function SlotBoard({ scrim, slots, myTeamIds = [] }: SlotBoardProps) {
  const cells = useMemo(() => buildCells(scrim, slots), [scrim, slots]);
  const myTeamIdSet = new Set(myTeamIds);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cells.map((cell) => {
        const slot = cell.slot;
        const hasTeam = Boolean(slot?.registered_team_id);
        const isMine = slot?.team_id ? myTeamIdSet.has(slot.team_id) : false;

        return (
          <div
            key={cell.slotNumber}
            className={cn(
              "rounded-2xl border p-4 text-card-foreground",
              hasTeam
                ? isMine
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
                : "border-dashed border-border bg-muted/30",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Slot {cell.slotNumber}
              </span>
              {isMine ? (
                <Badge className="gap-1">
                  <Crown className="size-3" />
                  You
                </Badge>
              ) : null}
            </div>

            {hasTeam && slot ? (
              <>
                <div className="truncate text-sm font-semibold text-foreground">
                  {slot.team_name || `Registered team #${slot.registered_team_id}`}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {slot.ingame_name || "No IGN"}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Empty</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildCells(scrim: Scrim, slots: Slot[]) {
  const byNumber = new Map(slots.map((slot) => [slot.slot_number, slot]));
  const highestExisting = slots.reduce(
    (max, slot) => Math.max(max, slot.slot_number),
    0,
  );
  const total = Math.max(scrim.max_slots ?? 16, highestExisting, 1);
  return Array.from({ length: total }, (_, index) => {
    const slotNumber = index + 1;
    return { slotNumber, slot: byNumber.get(slotNumber) };
  });
}
