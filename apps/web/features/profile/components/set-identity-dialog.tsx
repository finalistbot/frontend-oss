"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  isApiError,
  useDeleteGameIdentity,
  useSetGameIdentity,
  type Game,
  type GameIdentity,
} from "@repo/api";
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

interface SetIdentityDialogProps {
  game: Game;
  identity?: GameIdentity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetIdentityDialog({
  game,
  identity,
  open,
  onOpenChange,
}: SetIdentityDialogProps) {
  const setIdentity = useSetGameIdentity(game.id);
  const deleteIdentity = useDeleteGameIdentity(game.id);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset the field to the current identity each time the dialog opens.
  useEffect(() => {
    if (open) {
      setValue(identity?.ingame_name ?? "");
      setError(null);
    }
  }, [open, identity?.ingame_name]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("In-game name is required.");
      return;
    }
    setError(null);
    setIdentity.mutate(
      { ingame_name: trimmed },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) =>
          setError(isApiError(err) ? err.message : "Failed to save."),
      },
    );
  }

  function handleRemove() {
    setError(null);
    deleteIdentity.mutate(undefined, {
      onSuccess: () => onOpenChange(false),
      onError: (err) =>
        setError(isApiError(err) ? err.message : "Failed to remove."),
    });
  }

  const busy = setIdentity.isPending || deleteIdentity.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {identity ? "Edit in-game name" : "Add in-game name"}
          </DialogTitle>
          <DialogDescription>
            Set your in-game name for {game.name}. Captains see this on scrim
            slot lists.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="identity-ingame-name">In-game name</Label>
            <Input
              id="identity-ingame-name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={`Your ${game.name} in-game name`}
              autoFocus
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter className="sm:justify-between">
            {identity ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleRemove}
                disabled={busy}
              >
                {deleteIdentity.isPending ? "Removing..." : "Remove"}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {setIdentity.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
