"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@/lib/utils";
import { itemMatchesPath, sidebarItems } from "./sidebar-config";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  // Hide the toggle button when the viewport forces the compact layout —
  // tapping it on a phone would be a no-op since the media query overrides
  // the user's preference there.
  showToggle?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  showToggle = true,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-background transition-[width] duration-200 ease-out",
          collapsed ? "w-16" : "w-72",
        )}
      >
        {showToggle ? (
          <div
            className={cn(
              "flex h-12 items-center border-b border-sidebar-border",
              collapsed ? "justify-center" : "justify-end px-3",
            )}
          >
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto py-3">
          <ul className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
            {sidebarItems.map((item) => {
              const isActive = itemMatchesPath(item.href, pathname);

              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center rounded-md text-[0.95rem] font-medium transition-colors",
                    collapsed ? "justify-center" : "gap-3 px-3",
                    isActive
                      ? "bg-sidebar-primary/10 text-primary"
                      : "text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.Icon />
                  {collapsed ? null : <span>{item.label}</span>}
                </Link>
              );

              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
