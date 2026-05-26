"use client";

import { usePathname } from "next/navigation";
import { OrgSwitcher } from "./org-switcher";

// Render the last URL segment as the page title; "/manage" itself is "Dashboard".
function formatPathLabel(pathname: string) {
  if (pathname === "/manage") {
    return "Dashboard";
  }

  return (
    pathname
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") ?? "Dashboard"
  );
}

// Secondary header row inside /manage — sits below AppTopbar and shows the
// current page title on the left and the org switcher on the right. Account
// chrome lives in AppTopbar; this row is for page-level context.
export function Topbar() {
  const pathname = usePathname();

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border bg-background px-6">
      <div className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {formatPathLabel(pathname)}
      </div>
      <OrgSwitcher />
    </div>
  );
}
