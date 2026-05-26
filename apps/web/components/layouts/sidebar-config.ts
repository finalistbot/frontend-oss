"use client";

import {
  Building2,
  CalendarDays,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Swords,
} from "lucide-react";

export type SidebarItem = {
  href: string;
  label: string;
  Icon: React.ComponentType;
};

export const sidebarItems: SidebarItem[] = [
  { href: "/manage", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/manage/organizations", label: "Organization", Icon: Building2 },
  { href: "/manage/scrims", label: "Scrims", Icon: Swords },
  { href: "/manage/inbox", label: "Inbox", Icon: Inbox },
  { href: "/manage/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/manage/presets", label: "Presets", Icon: LayoutTemplate },
];

// Match a sidebar item for both its exact route and nested detail pages.
// `/manage` matches only the manage root; deeper hrefs match their full subtree.
export function itemMatchesPath(itemHref: string, pathname: string) {
  if (itemHref === "/manage") {
    return pathname === "/manage";
  }

  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}
