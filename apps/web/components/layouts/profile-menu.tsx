"use client";

import Link from "next/link";
import { LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "@repo/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useTheme, type ThemeMode } from "@/core/theme";

// Two-letter initials for the avatar fallback. Splits on common separators.
function getInitials(value: string) {
  const segments = value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "");
  return segments.join("") || value.slice(0, 2).toUpperCase();
}

export function ProfileMenu() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const displayName = user?.username || user?.email?.split("@")[0] || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 transition-colors hover:bg-foreground/5 focus-visible:border-border focus-visible:outline-none"
        aria-label="Open account menu"
      >
        <Avatar size="sm">
          {user?.avatar_url ? <AvatarImage src={user.avatar_url} alt="" /> : null}
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium text-foreground sm:inline">
          {displayName}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{displayName}</span>
          {user?.email ? (
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          ) : null}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <UserRound className="size-4" /> Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as ThemeMode)}
        >
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild variant="destructive">
          <Link href="/logout" className="flex items-center gap-2">
            <LogOut className="size-4" /> Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
