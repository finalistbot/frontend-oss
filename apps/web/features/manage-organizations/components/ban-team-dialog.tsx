"use client";

import { useEffect, useState } from "react";
import { isApiError, useBanOrgTeam } from "@repo/api";
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

interface BanTeamDialogProps {
  orgId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function mapErrorMessage(code: string) {
  switch (code) {
    case "team_already_banned":
      return "That team is already banned from this organization.";
    case "insufficient_role":
      return "You don't have permission to ban teams in this org.";
    default:
      return "Could not ban team. Please try again.";
  }
}

export function BanTeamDialog({ orgId, open, onOpenChange }: BanTeamDialogProps) {
  const ban = useBanOrgTeam(orgId);
  const [teamId, setTeamId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTeamId("");
      setReason("");
      setError(null);
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = Number.parseInt(teamId, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid team ID.");
      return;
    }
    ban.mutate(
      { team_id: parsed, reason: reason.trim() || undefined },
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
          <DialogTitle>Ban a team</DialogTitle>
          <DialogDescription>
            Banned teams cannot register for any scrim hosted by this
            organization until the ban is lifted.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="ban-team-id">Team ID</Label>
            <Input
              id="ban-team-id"
              type="number"
              min={1}
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="42"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the numeric team ID. Team search is on the roadmap.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ban-team-reason">Reason (optional)</Label>
            <Textarea
              id="ban-team-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Repeat lineup violations"
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
              {ban.isPending ? "Banning..." : "Ban team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
