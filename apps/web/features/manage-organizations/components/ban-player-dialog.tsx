"use client";

import { useEffect, useState } from "react";
import { isApiError, useBanOrgPlayer } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";

interface BanPlayerDialogProps {
  orgId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function mapErrorMessage(code: string) {
  switch (code) {
    case "player_already_banned":
      return "That player is already banned from this organization.";
    case "insufficient_role":
      return "You don't have permission to ban players in this org.";
    default:
      return "Could not ban player. Please try again.";
  }
}

export function BanPlayerDialog({ orgId, open, onOpenChange }: BanPlayerDialogProps) {
  const ban = useBanOrgPlayer(orgId);
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUserId("");
      setReason("");
      setError(null);
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = Number.parseInt(userId, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid user ID.");
      return;
    }
    ban.mutate(
      { user_id: parsed, reason: reason.trim() || undefined },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) =>
          setError(mapErrorMessage(isApiError(err) ? err.code : "unknown")),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Ban a player</DialogTitle>
          <DialogDescription>
            Banned players cannot register for any scrim hosted by this
            organization until the ban is lifted.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="ban-player-user-id">User ID</Label>
            <Input
              id="ban-player-user-id"
              type="number"
              min={1}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="42"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the numeric user ID. Username search is on the roadmap.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ban-player-reason">Reason (optional)</Label>
            <Textarea
              id="ban-player-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Smurfing on banned account"
              rows={3}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={ban.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={ban.isPending}>
              {ban.isPending ? "Banning..." : "Ban player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
