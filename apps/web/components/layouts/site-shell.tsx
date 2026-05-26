import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto grid max-w-7xl gap-8">{children}</div>;
}
