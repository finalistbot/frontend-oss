"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const PREFIX_KEY = "g";
const PREFIX_TIMEOUT_MS = 1000;

const MAP: Record<string, string> = {
  p: "/play",
  m: "/manage",
};

// GitHub-style two-key shortcuts: press `g` then `p`/`m` within 1s to
// navigate. Ignores keypresses inside inputs/textareas/contenteditable so
// users can still type "g" in forms.
export function useGoShortcuts() {
  const router = useRouter();
  const armedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function reset() {
      armedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return false;
    }

    function handler(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        reset();
        return;
      }
      if (isTypingTarget(event.target)) {
        reset();
        return;
      }

      const key = event.key.toLowerCase();

      if (armedRef.current) {
        const target = MAP[key];
        reset();
        if (target) {
          event.preventDefault();
          router.push(target);
        }
        return;
      }

      if (key === PREFIX_KEY) {
        armedRef.current = true;
        timerRef.current = setTimeout(reset, PREFIX_TIMEOUT_MS);
      }
    }

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      reset();
    };
  }, [router]);
}
