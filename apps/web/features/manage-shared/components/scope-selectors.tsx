"use client";

import { useEffect } from "react";
import { useGameModes, useGames, useMyOrgs, type Game, type GameMode } from "@repo/api";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

export interface ScopeValue {
  organizationId: number | null;
  gameId: number | null;
  gameModeId: number | null;
}

interface ScopeSelectorsProps {
  value: ScopeValue;
  onChange: (next: ScopeValue) => void;
  // When false the org picker is hidden — used by surfaces that scope by URL
  // (e.g. an org-specific create flow) rather than by user choice.
  showOrg?: boolean;
  // Marks game/mode required so the form-level submit button can disable
  // until they're filled.
  requireMode?: boolean;
}

// Reusable Org / Game / Mode dropdown trio. Mode list refetches when game
// changes; mode selection auto-clears if the previous mode doesn't belong to
// the new game.
export function ScopeSelectors({
  value,
  onChange,
  showOrg = true,
  requireMode = true,
}: ScopeSelectorsProps) {
  const orgs = useMyOrgs({ limit: 50 });
  const games = useGames({ active: true, limit: 50 });
  const modes = useGameModes(value.gameId ?? 0, true, {
    enabled: (value.gameId ?? 0) > 0,
  });

  // Clear mode if it doesn't belong to the currently selected game.
  useEffect(() => {
    if (!value.gameId || !value.gameModeId) return;
    const list = modes.data ?? [];
    if (list.length === 0) return;
    if (!list.some((m: GameMode) => m.id === value.gameModeId)) {
      onChange({ ...value, gameModeId: null });
    }
  }, [modes.data, onChange, value]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {showOrg ? (
        <div className="grid gap-2">
          <Label htmlFor="scope-org">Organization</Label>
          <Select
            value={value.organizationId ? String(value.organizationId) : ""}
            onValueChange={(next) =>
              onChange({ ...value, organizationId: Number.parseInt(next, 10) })
            }
          >
            <SelectTrigger id="scope-org">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {orgs.data?.data.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="scope-game">Game</Label>
        <Select
          value={value.gameId ? String(value.gameId) : ""}
          onValueChange={(next) =>
            onChange({
              ...value,
              gameId: Number.parseInt(next, 10),
              gameModeId: null,
            })
          }
        >
          <SelectTrigger id="scope-game">
            <SelectValue placeholder="Select game" />
          </SelectTrigger>
          <SelectContent>
            {games.data?.data.map((g: Game) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="scope-mode">
          Mode {requireMode ? <span className="text-destructive">*</span> : null}
        </Label>
        <Select
          value={value.gameModeId ? String(value.gameModeId) : ""}
          onValueChange={(next) =>
            onChange({ ...value, gameModeId: Number.parseInt(next, 10) })
          }
          disabled={!value.gameId}
        >
          <SelectTrigger id="scope-mode">
            <SelectValue placeholder={value.gameId ? "Select mode" : "Pick a game first"} />
          </SelectTrigger>
          <SelectContent>
            {modes.data?.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
