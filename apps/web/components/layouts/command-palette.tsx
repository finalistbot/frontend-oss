"use client";

import {
  CalendarDays,
  Gamepad2,
  HomeIcon,
  Inbox,
  LayoutDashboard,
  ListTree,
  LogOut,
  Settings2,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/command";
import { useTheme } from "@/core/theme";

interface CommandAction {
  label: string;
  onSelect: () => void;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  keywords?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Renders the Cmd+K palette content. Mounting / shortcut handling lives in the
// `useCommandPalette` hook so the AppTopbar owns the open state.
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  // Each action closes the palette before navigating so the dialog doesn't
  // re-open into an unmounted route.
  const navigate = useCallback(
    (href: string) => () => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  const switchTheme = useCallback(
    (mode: "light" | "dark" | "system") => () => {
      onOpenChange(false);
      setTheme(mode);
    },
    [onOpenChange, setTheme],
  );

  const navGroups: { heading: string; items: CommandAction[] }[] = [
    {
      heading: "Navigate",
      items: [
        {
          label: "Player home",
          icon: HomeIcon,
          onSelect: navigate("/play"),
          shortcut: "G P",
          keywords: "player dashboard",
        },
        {
          label: "Manage dashboard",
          icon: LayoutDashboard,
          onSelect: navigate("/manage"),
          shortcut: "G M",
          keywords: "host admin organization",
        },
      ],
    },
    {
      heading: "Player",
      items: [
        {
          label: "My teams",
          icon: UsersRound,
          onSelect: navigate("/play/teams"),
          keywords: "roster captain",
        },
        {
          label: "Browse scrims",
          icon: Trophy,
          onSelect: navigate("/play/scrims"),
          keywords: "match tournament",
        },
        {
          label: "Game identities",
          icon: Gamepad2,
          onSelect: navigate("/play/game-identity"),
          keywords: "ign in-game name",
        },
      ],
    },
    {
      heading: "Manage",
      items: [
        {
          label: "Organizations",
          icon: ShieldCheck,
          onSelect: navigate("/manage/organizations"),
          keywords: "org admin",
        },
        {
          label: "Scrims",
          icon: Trophy,
          onSelect: navigate("/manage/scrims"),
        },
        {
          label: "Presets",
          icon: ListTree,
          onSelect: navigate("/manage/presets"),
          keywords: "recurring schedule template",
        },
        {
          label: "Calendar",
          icon: CalendarDays,
          onSelect: navigate("/manage/calendar"),
        },
        {
          label: "Inbox",
          icon: Inbox,
          onSelect: navigate("/manage/inbox"),
        },
      ],
    },
    {
      heading: "Account",
      items: [
        {
          label: "Switch to light theme",
          icon: Settings2,
          onSelect: switchTheme("light"),
          keywords: "appearance",
        },
        {
          label: "Switch to dark theme",
          icon: Settings2,
          onSelect: switchTheme("dark"),
          keywords: "appearance",
        },
        {
          label: "Use system theme",
          icon: Settings2,
          onSelect: switchTheme("system"),
          keywords: "appearance auto",
        },
        {
          label: "Log out",
          icon: LogOut,
          onSelect: navigate("/logout"),
          keywords: "sign out",
        },
      ],
    },
  ];

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Jump to a page or run an action"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {navGroups.map((group, idx) => (
          <Group
            key={group.heading}
            heading={group.heading}
            items={group.items}
            withSeparator={idx < navGroups.length - 1}
          />
        ))}
      </CommandList>
    </CommandDialog>
  );
}

function Group({
  heading,
  items,
  withSeparator,
}: {
  heading: string;
  items: CommandAction[];
  withSeparator: boolean;
}) {
  return (
    <>
      <CommandGroup heading={heading}>
        {items.map((item) => (
          <CommandItem
            key={item.label}
            value={`${item.label} ${item.keywords ?? ""}`}
            onSelect={item.onSelect}
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
            {item.shortcut ? (
              <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                {item.shortcut}
              </kbd>
            ) : null}
          </CommandItem>
        ))}
      </CommandGroup>
      {withSeparator ? <CommandSeparator /> : null}
    </>
  );
}

// Hook that wires Cmd+K (mac) / Ctrl+K (other) to toggle palette open.
// Returns [open, setOpen] so the trigger button can also flip the state.
export function useCommandPaletteShortcut() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      const isToggle =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      if (!isToggle) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return [open, setOpen] as const;
}
