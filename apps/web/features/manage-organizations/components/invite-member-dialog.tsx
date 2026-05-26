"use client";

import { useEffect, useState } from "react";
import { isApiError, useInviteOrgMember } from "@repo/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

interface InviteMemberDialogProps {
  orgId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function mapErrorMessage(code: string) {
  switch (code) {
    case "already_member":
      return "That user is already a member.";
    case "invite_already_sent":
      return "There's already a pending invite for that user.";
    case "insufficient_role":
      return "You don't have permission to invite to this org.";
    default:
      return "Could not send invite. Please try again.";
  }
}

export function InviteMemberDialog({
  orgId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const invite = useInviteOrgMember(orgId);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"admin" | "moderator">("moderator");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUserId("");
      setRole("moderator");
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
    invite.mutate(
      { user_id: parsed, role },
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
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Send a pending invite to a user. They must accept from their inbox.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="invite-user-id">User ID</Label>
            <Input
              id="invite-user-id"
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
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "moderator") => setRole(value)}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={invite.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
