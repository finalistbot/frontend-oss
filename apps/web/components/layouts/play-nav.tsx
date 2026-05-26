"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/play", label: "Home" },
  { href: "/play/scrims", label: "Scrims" },
  { href: "/play/teams", label: "Teams" },
];

export function PlayNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-14 z-30 border-b border-border bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6">
      <nav
        className="mx-auto flex h-12 max-w-6xl items-center gap-2"
        aria-label="Play navigation"
      >
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/play" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
