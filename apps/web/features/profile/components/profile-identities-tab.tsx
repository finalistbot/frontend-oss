"use client";

import { useState } from "react";
import {
  useGameIdentities,
  useGames,
  type Game,
  type GameIdentity,
} from "@repo/api";
import { Copy, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetIdentityDialog } from "./set-identity-dialog";

export function ProfileIdentitiesTab() {
  const games = useGames({ active: true, limit: 100 });
  const identities = useGameIdentities();
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const isLoading = games.isLoading || identities.isLoading;
  const allGames = games.data?.data ?? [];

  const identityByGame = new Map<number, GameIdentity>();
  for (const identity of identities.data ?? []) {
    identityByGame.set(identity.game_id, identity);
  }

  const setGames = allGames.filter((g) => identityByGame.has(g.id));
  const unsetGames = allGames.filter((g) => !identityByGame.has(g.id));

  async function copy(identity: GameIdentity) {
    try {
      await navigator.clipboard.writeText(identity.ingame_name);
      setCopiedId(identity.game_id);
      setTimeout(() => setCopiedId((current) => (current === identity.game_id ? null : current)), 1400);
    } catch {
      // Clipboard can fail in non-secure contexts; surface nothing for now.
    }
  }

  return (
    <>
      <div className="space-y-10">
        <Section title="Game identities">
          {isLoading ? (
            <LoadingHint />
          ) : setGames.length === 0 ? (
            <EmptyHint message="You haven't set an in-game name for any game yet." />
          ) : (
            <CardGrid>
              {setGames.map((game) => {
                const identity = identityByGame.get(game.id);
                if (!identity) return null;
                return (
                  <IdentityCard
                    key={game.id}
                    game={game}
                    identity={identity}
                    copied={copiedId === game.id}
                    onCopy={() => copy(identity)}
                    onEdit={() => setEditingGame(game)}
                  />
                );
              })}
            </CardGrid>
          )}
        </Section>

        <Section title="Add for these games">
          {isLoading ? (
            <LoadingHint />
          ) : unsetGames.length === 0 ? (
            <EmptyHint message="All caught up — you have an IGN set for every active game." />
          ) : (
            <CardGrid>
              {unsetGames.map((game) => (
                <AddGameCard
                  key={game.id}
                  game={game}
                  onAdd={() => setEditingGame(game)}
                />
              ))}
            </CardGrid>
          )}
        </Section>
      </div>

      {editingGame ? (
        <SetIdentityDialog
          game={editingGame}
          identity={identityByGame.get(editingGame.id)}
          open
          onOpenChange={(open) => {
            if (!open) setEditingGame(null);
          }}
        />
      ) : null}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3 border-t border-border pt-5">{children}</div>
    </section>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
  );
}

function IdentityCard({
  game,
  identity,
  copied,
  onCopy,
  onEdit,
}: {
  game: Game;
  identity: GameIdentity;
  copied: boolean;
  onCopy: () => void;
  onEdit: () => void;
}) {
  return (
    <li>
      <div className="group relative flex h-full flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          {game.name}
        </div>
        <div className="font-primary text-xl font-bold uppercase tracking-[0.04em] text-foreground sm:text-2xl">
          {identity.ingame_name}
        </div>
        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <IconButton
            label={copied ? "Copied" : `Copy ${game.name} in-game name`}
            onClick={onCopy}
          >
            <Copy
              className={cn(
                "size-3.5 transition-colors",
                copied ? "text-primary" : undefined,
              )}
            />
          </IconButton>
          <IconButton label={`Edit ${game.name} in-game name`} onClick={onEdit}>
            <Pencil className="size-3.5" />
          </IconButton>
        </div>
      </div>
    </li>
  );
}

function AddGameCard({ game, onAdd }: { game: Game; onAdd: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onAdd}
        className="group flex h-full w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-primary/50 hover:bg-card/80"
      >
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {game.publisher ?? "Game"}
          </div>
          <div className="font-primary text-xl font-bold uppercase tracking-[0.04em] text-foreground sm:text-2xl">
            {game.name}
          </div>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors group-hover:border-primary/50 group-hover:text-primary">
          <Plus className="size-4" />
        </span>
      </button>
    </li>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {children}
    </button>
  );
}

function LoadingHint() {
  return <p className="text-sm text-muted-foreground">Loading games...</p>;
}

function EmptyHint({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}
