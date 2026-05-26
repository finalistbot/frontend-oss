import { cn } from "@/lib/utils";

// Shared brand mark — backed by /public/logo.svg. Callers control the size via
// `className` (e.g. `h-6 w-6` in the topbar, `h-24 w-24` in the splash); the
// image letterboxes inside that box via `object-contain` so the 297×258 aspect
// ratio is preserved at any size.
export function FinalistMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Finalist"
      className={cn("inline-block h-6 w-6 shrink-0 object-contain", className)}
    />
  );
}
