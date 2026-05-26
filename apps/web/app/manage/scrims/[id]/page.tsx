"use client";

import { useMemo, useState, type DragEvent as ReactDragEvent } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  isApiError,
  useAssignSlot,
  useClearSlot,
  useCloseScrimRegistration,
  useEndScrim,
  useOpenScrimRegistration,
  usePromoteScrim,
  useResetScrimSlots,
  useScrim,
  useScrimRegistrationRealtime,
  useScrimSlots,
  useScrimWaitlist,
  useStartScrim,
  useSwapSlots,
  useUpdateSlot,
  type RegisteredTeam,
  type Scrim,
  type Slot,
} from "@repo/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { GripVertical, RadioTower, RotateCcw, Users } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageBody } from "@/components/layouts/page-body";
import { PageHeader } from "@/components/layouts/page-header";
import { appConfig } from "@/config";
import { cn } from "@/lib/utils";

type DragPayload =
  | {
      kind: "slot";
      registeredTeamId: number;
      slotId: number;
      slotNumber: number;
    }
  | {
      kind: "waitlist";
      registeredTeamId: number;
    };

type SlotCell = {
  slotNumber: number;
  slot?: Slot;
};

export default function ManageScrimDetailPage() {
  const params = useParams<{ id: string }>();
  const scrimId = Number.parseInt(params.id, 10);
  const isValidId = Number.isFinite(scrimId) && scrimId > 0;

  const scrimQuery = useScrim(scrimId, { enabled: isValidId });

  if (!isValidId) notFound();

  if (scrimQuery.isLoading) {
    return (
      <>
        <PageHeader title="Scrim" />
        <PageBody>
          <p className="text-sm text-muted-foreground">Loading scrim...</p>
        </PageBody>
      </>
    );
  }

  if (scrimQuery.error) {
    if (isApiError(scrimQuery.error) && scrimQuery.error.code === "scrim_not_found") {
      notFound();
    }
    return (
      <>
        <PageHeader title="Scrim" />
        <PageBody>
          <p className="text-sm text-destructive">
            {isApiError(scrimQuery.error)
              ? scrimQuery.error.message
              : "Failed to load scrim."}
          </p>
        </PageBody>
      </>
    );
  }

  const scrim = scrimQuery.data;
  if (!scrim) return null;

  return (
    <>
      <PageHeader
        title={scrim.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <ScrimStatusBadge status={scrim.status} />
            <Badge variant="outline">{scrim.visibility}</Badge>
            <span>{new Date(scrim.starts_at).toLocaleString()}</span>
          </span>
        }
        action={
          <>
            <LifecycleActions scrim={scrim} />
            <Button asChild variant="outline">
              <Link href="/manage/scrims">All scrims</Link>
            </Button>
          </>
        }
      />
      <PageBody>
        <Tabs defaultValue="slots" className="w-full">
          <TabsList>
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="slots" className="mt-6">
            <SlotManagement scrim={scrim} />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <ScrimOverview scrim={scrim} />
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

function SlotManagement({ scrim }: { scrim: Scrim }) {
  const slotsQuery = useScrimSlots(scrim.id);
  const waitlistQuery = useScrimWaitlist(scrim.id);
  const assignSlot = useAssignSlot(scrim.id);
  const updateSlot = useUpdateSlot(scrim.id);
  const swapSlots = useSwapSlots(scrim.id);
  const clearSlot = useClearSlot(scrim.id);
  const resetSlots = useResetScrimSlots(scrim.id);
  const [dragged, setDragged] = useState<DragPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);
  // Tap-to-pick fallback for touch devices — drag-and-drop doesn't work
  // there. Holds the empty slot the user tapped; the picker dialog lists
  // waitlisted teams to assign.
  const [pickerCell, setPickerCell] = useState<SlotCell | null>(null);

  useScrimRegistrationRealtime(scrim.id, appConfig.apiBaseUrl, {
    onEvent: () => setLastEventAt(new Date()),
  });

  const waitlist = waitlistQuery.data ?? [];
  const cells = useMemo(
    () => buildSlotCells(scrim, slotsQuery.data ?? []),
    [scrim, slotsQuery.data],
  );
  const filledCount = (slotsQuery.data ?? []).filter(
    (slot) => slot.registered_team_id,
  ).length;
  const pending =
    assignSlot.isPending ||
    updateSlot.isPending ||
    swapSlots.isPending ||
    clearSlot.isPending ||
    resetSlots.isPending;

  async function confirmReset() {
    setError(null);
    setResetOpen(false);
    try {
      await resetSlots.mutateAsync();
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to reset slots.");
    }
  }

  async function handleSlotDrop(target: SlotCell) {
    if (!dragged || pending) return;
    setError(null);

    try {
      if (dragged.kind === "waitlist") {
        await writeTeamToSlot(target, dragged.registeredTeamId);
        return;
      }

      if (dragged.slotNumber === target.slotNumber) return;

      if (target.slot?.registered_team_id && target.slot.id) {
        await swapSlots.mutateAsync({
          slot_a_id: dragged.slotId,
          slot_b_id: target.slot.id,
        });
        return;
      }

      await clearSlot.mutateAsync(dragged.slotId);
      await writeTeamToSlot(target, dragged.registeredTeamId);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to update slot.");
    }
  }

  async function writeTeamToSlot(target: SlotCell, registeredTeamId: number) {
    if (target.slot?.id) {
      await updateSlot.mutateAsync({
        slotId: target.slot.id,
        body: { registered_team_id: registeredTeamId },
      });
      return;
    }
    await assignSlot.mutateAsync({
      slot_number: target.slotNumber,
      registered_team_id: registeredTeamId,
    });
  }

  async function handleWaitlistDrop() {
    if (!dragged || dragged.kind !== "slot" || pending) return;
    setError(null);
    try {
      await clearSlot.mutateAsync(dragged.slotId);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to move team to waitlist.");
    }
  }

  async function handlePickTeam(team: RegisteredTeam) {
    if (!pickerCell || pending) return;
    setError(null);
    try {
      await writeTeamToSlot(pickerCell, team.id);
      setPickerCell(null);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to assign team.");
    }
  }

  function onDragOver(event: ReactDragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  if (slotsQuery.isLoading || waitlistQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading slot list...</p>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live slot board</h2>
            <p className="text-sm text-muted-foreground">
              Drag waitlisted teams into slots, or drag slotted teams to reorder.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pending || filledCount === 0}
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw className="size-4" />
              Reset slots
            </Button>
            <RealtimeBadge lastEventAt={lastEventAt} />
          </div>
        </div>

        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset every slot?</AlertDialogTitle>
              <AlertDialogDescription>
                Removes all team assignments from the slot list. Teams stay registered
                — they drop back into the waitlist and you can reassign them. Currently
                {" "}
                {filledCount} {filledCount === 1 ? "slot is" : "slots are"} filled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReset}>Reset slots</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
          {cells.map((cell) => (
            <SlotCard
              key={cell.slotNumber}
              cell={cell}
              disabled={pending}
              dragging={dragged}
              onDragStart={setDragged}
              onDragEnd={() => setDragged(null)}
              onDragOver={onDragOver}
              onDrop={() => handleSlotDrop(cell)}
              onPick={() => setPickerCell(cell)}
              onClear={async () => {
                if (!cell.slot?.id || pending) return;
                setError(null);
                try {
                  await clearSlot.mutateAsync(cell.slot.id);
                } catch (err) {
                  setError(isApiError(err) ? err.message : "Failed to clear slot.");
                }
              }}
            />
          ))}
        </div>

        <SlotTeamPickerDialog
          open={pickerCell !== null}
          onOpenChange={(open) => {
            if (!open) setPickerCell(null);
          }}
          cell={pickerCell}
          waitlist={waitlist}
          busy={pending}
          onPick={handlePickTeam}
        />
      </section>

      <aside>
        <Card
          className="sticky top-20"
          onDragOver={onDragOver}
          onDrop={handleWaitlistDrop}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" />
              Waitlist
            </CardTitle>
            <CardDescription>
              Drop a slotted team here to remove it from the slot list.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {waitlist.length === 0 ? (
              <EmptyState
                title="No waitlisted teams"
                description="Teams appear here when registration is full or manual slots are pending."
              />
            ) : (
              waitlist.map((team) => (
                <WaitlistTeamCard
                  key={team.id}
                  team={team}
                  disabled={pending}
                  onDragStart={setDragged}
                  onDragEnd={() => setDragged(null)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SlotCard({
  cell,
  disabled,
  dragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onPick,
  onClear,
}: {
  cell: SlotCell;
  disabled: boolean;
  dragging: DragPayload | null;
  onDragStart: (payload: DragPayload) => void;
  onDragEnd: () => void;
  onDragOver: (event: ReactDragEvent) => void;
  onDrop: () => void;
  onPick: () => void;
  onClear: () => void;
}) {
  const slot = cell.slot;
  const hasTeam = Boolean(slot?.registered_team_id);
  const isSource =
    dragging?.kind === "slot" &&
    slot?.id === dragging.slotId &&
    slot?.registered_team_id === dragging.registeredTeamId;

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "group flex h-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
        hasTeam
          ? "border-border bg-card"
          : "border-dashed border-muted-foreground/30 bg-muted/20",
        dragging ? "hover:border-primary hover:bg-primary/5" : "",
        isSource ? "opacity-50" : "",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md text-xs font-bold tabular-nums",
          hasTeam
            ? "bg-primary/15 text-primary"
            : "bg-background text-muted-foreground",
        )}
      >
        {cell.slotNumber}
      </span>

      {hasTeam && slot ? (
        <>
          <div
            draggable={!disabled}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              onDragStart({
                kind: "slot",
                registeredTeamId: slot.registered_team_id!,
                slotId: slot.id,
                slotNumber: slot.slot_number,
              });
            }}
            onDragEnd={onDragEnd}
            className={cn(
              "flex min-w-0 flex-1 cursor-grab items-center gap-2 active:cursor-grabbing",
              disabled ? "cursor-not-allowed opacity-70" : "",
            )}
          >
            <GripVertical className="size-4 shrink-0 text-muted-foreground/60" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight text-foreground">
                {slot.team_name || `Team #${slot.registered_team_id}`}
              </div>
              <div className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">
                {slot.ingame_name || "No IGN"}
              </div>
            </div>
          </div>

          {slot.id ? (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              aria-label={`Clear slot ${cell.slotNumber}`}
              title="Clear slot"
              className="shrink-0 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          onClick={onPick}
          disabled={disabled}
          className="flex-1 truncate text-left text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground disabled:cursor-not-allowed"
        >
          Tap or drop a team
        </button>
      )}
    </div>
  );
}

function SlotTeamPickerDialog({
  open,
  onOpenChange,
  cell,
  waitlist,
  busy,
  onPick,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  cell: SlotCell | null;
  waitlist: RegisteredTeam[];
  busy: boolean;
  onPick: (team: RegisteredTeam) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            Place team in slot {cell?.slotNumber ?? ""}
          </DialogTitle>
          <DialogDescription>
            Choose a waitlisted team to assign. Drag-and-drop still works on
            desktop.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 max-h-[60vh] overflow-y-auto px-1">
          {waitlist.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No teams waiting. Teams appear here once they register.
            </p>
          ) : (
            <ul className="space-y-2">
              {waitlist.map((team) => {
                const initials = teamInitials(team.name);
                return (
                  <li key={team.id}>
                    <button
                      type="button"
                      onClick={() => onPick(team)}
                      disabled={busy}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold uppercase tracking-wide text-primary">
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {team.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {team.ingame_name || "No IGN"}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WaitlistTeamCard({
  team,
  disabled,
  onDragStart,
  onDragEnd,
}: {
  team: RegisteredTeam;
  disabled: boolean;
  onDragStart: (payload: DragPayload) => void;
  onDragEnd: () => void;
}) {
  const initials = teamInitials(team.name);
  return (
    <div
      draggable={!disabled}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart({ kind: "waitlist", registeredTeamId: team.id });
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex cursor-grab items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50 hover:bg-primary/5 active:cursor-grabbing",
        disabled ? "cursor-not-allowed opacity-70" : "",
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold uppercase tracking-wide text-primary">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {team.name}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {team.ingame_name || "No IGN set"}
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          Registered #{team.id}
        </div>
      </div>
      <GripVertical className="size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
    </div>
  );
}

function teamInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "??").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function ScrimOverview({ scrim }: { scrim: Scrim }) {
  const fields = [
    ["Registration opens", new Date(scrim.registration_open_at).toLocaleString()],
    ["Registration closes", new Date(scrim.registration_close_at).toLocaleString()],
    ["Starts", new Date(scrim.starts_at).toLocaleString()],
    ["Ends", new Date(scrim.ends_at).toLocaleString()],
    ["Auto slots", scrim.auto_slotlist ? "Enabled" : "Manual"],
    ["Max slots", scrim.max_slots ?? "Unlimited"],
    ["Min lineup", scrim.min_lineup_size],
    ["Require IGN", scrim.require_ign ? "Yes" : "No"],
    ["Live slots", scrim.live_slots_visible ? "Visible during registration" : "Hidden until close"],
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {fields.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl border border-border bg-card p-4 text-card-foreground"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
        </div>
      ))}
    </section>
  );
}

function LifecycleActions({ scrim }: { scrim: Scrim }) {
  const promote = usePromoteScrim(scrim.id);
  const openRegistration = useOpenScrimRegistration(scrim.id);
  const closeRegistration = useCloseScrimRegistration(scrim.id);
  const startScrim = useStartScrim(scrim.id);
  const endScrim = useEndScrim(scrim.id);
  const [finishOpen, setFinishOpen] = useState(false);
  const pending =
    promote.isPending ||
    openRegistration.isPending ||
    closeRegistration.isPending ||
    startScrim.isPending ||
    endScrim.isPending;

  if (scrim.status === "draft") {
    return (
      <Button size="sm" disabled={pending} onClick={() => promote.mutate()}>
        Promote
      </Button>
    );
  }
  if (scrim.status === "upcoming") {
    return (
      <Button size="sm" disabled={pending} onClick={() => openRegistration.mutate()}>
        Open registration
      </Button>
    );
  }
  if (scrim.status === "registration_open") {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => closeRegistration.mutate()}
      >
        Close registration
      </Button>
    );
  }
  if (scrim.status === "registration_closed") {
    return (
      <Button size="sm" disabled={pending} onClick={() => startScrim.mutate()}>
        Start scrim
      </Button>
    );
  }
  if (scrim.status === "ongoing") {
    return (
      <>
        <Button
          size="sm"
          disabled={pending}
          onClick={() => setFinishOpen(true)}
        >
          Finish scrim
        </Button>
        <AlertDialog open={finishOpen} onOpenChange={setFinishOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finish this scrim?</AlertDialogTitle>
              <AlertDialogDescription>
                Marks the scrim as completed and moves it into the archive.
                Slot edits and team changes will be locked.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setFinishOpen(false);
                  endScrim.mutate();
                }}
              >
                Finish scrim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
  return null;
}

function RealtimeBadge({ lastEventAt }: { lastEventAt: Date | null }) {
  return (
    <Badge variant="outline" className="gap-2">
      <RadioTower className="size-3" />
      {lastEventAt ? `Synced ${lastEventAt.toLocaleTimeString()}` : "Live sync on"}
    </Badge>
  );
}

function ScrimStatusBadge({ status }: { status: Scrim["status"] }) {
  if (status === "registration_open") return <Badge>{status}</Badge>;
  if (status === "ongoing") return <Badge variant="secondary">{status}</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function buildSlotCells(scrim: Scrim, slots: Slot[]): SlotCell[] {
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
