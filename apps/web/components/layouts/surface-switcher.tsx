"use client";

import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Gamepad2, Wrench } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@/lib/utils";

interface Surface {
  segment: string;
  href: string;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const surfaces: Surface[] = [
  {
    segment: "play",
    href: "/play",
    label: "Play",
    description: "Join scrims, register your team",
    icon: Gamepad2,
  },
  {
    segment: "manage",
    href: "/manage",
    label: "Manage",
    description: "Host scrims, run your org",
    icon: Wrench,
  },
];

// "You are in: <Surface> ▾" workspace-style pill, mounted next to the brand
// in the topbar. Active surface is derived from the layout segment so nested
// routes (e.g. /manage/scrims/12) keep Manage highlighted. Open the menu to
// switch.
export function SurfaceSwitcher() {
  const router = useRouter();
  // useSelectedLayoutSegment reads "one level below the calling layout" —
  // since the topbar is mounted inside app/play/layout.tsx and
  // app/manage/layout.tsx, that returns the route *under* play/manage rather
  // than "play"/"manage" themselves. Read the pathname's first segment for
  // a stable answer regardless of which layout we live under.
  const pathname = usePathname() ?? "/";
  const firstSegment = pathname.split("/")[1] ?? "";
  // surfaces is a known non-empty constant so the fallback is always defined.
  const active = (surfaces.find((s) => s.segment === firstSegment) ?? surfaces[0]) as Surface;
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch between Play and Manage"
        className="group inline-flex h-8 items-center gap-2 rounded-full border border-border bg-muted-background/60 pl-2.5 pr-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted-background focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <ActiveIcon className="size-3.5 text-muted-foreground" />
        <span className="tracking-[0.02em]">{active.label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={6} className="w-64">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {surfaces.map((s) => {
          const Icon = s.icon;
          const isActive = s.segment === active.segment;
          return (
            <DropdownMenuItem
              key={s.segment}
              onSelect={() => router.push(s.href)}
              className={cn(
                "flex cursor-pointer items-start gap-3 py-2.5",
                isActive && "bg-accent/40",
              )}
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {s.label}
                  {isActive ? (
                    <Check className="size-3.5 text-primary" aria-hidden />
                  ) : null}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {s.description}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
