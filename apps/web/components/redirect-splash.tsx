"use client";

import { FinalistMark } from "@/components/finalist-mark";
import { cn } from "@/lib/utils";

type RedirectSplashProps = {
  // Override the default caption ("Loading your dashboard...") for non-login
  // redirects.
  message?: string;
  className?: string;
};

// Fullscreen blocking overlay shown while we navigate the user from /login
// (or the OAuth callback) into /play. The browser still does its own paint
// during the cross-document navigation; this overlay keeps the brand visible
// during that window so the page doesn't flash back to the form.
export function RedirectSplash({
  message = "Loading your dashboard...",
  className,
}: RedirectSplashProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#070d1b] text-white",
        className,
      )}
    >
      <BackgroundGlow />

      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 -m-8 rounded-full bg-primary/25 blur-3xl animate-pulse"
          />
          <FinalistMark className="relative h-20 w-20 animate-[pulse_1.6s_ease-in-out_infinite] sm:h-24 sm:w-24" />
        </div>

        <h1 className="font-primary text-5xl font-bold uppercase tracking-[0.5em] text-white sm:text-6xl md:text-7xl">
          Finalist
        </h1>

        <div className="flex items-center gap-2" aria-hidden>
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </div>

        <p className="text-xs uppercase tracking-[0.4em] text-white/40">{message}</p>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      style={{ animationDelay: delay }}
      className="size-2 rounded-full bg-primary animate-bounce"
    />
  );
}

function BackgroundGlow() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-[320px] w-[320px] rounded-full bg-[#7d3cff]/15 blur-[120px]"
      />
    </>
  );
}
