import type { ReactNode } from "react";

// Body wrapper for /manage pages. Keeps content centered + max-width while
// the sibling PageHeader stays edge-to-edge.
export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 py-6 md:px-8">
      {children}
    </div>
  );
}
