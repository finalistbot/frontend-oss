"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAuthErrorCode,
  updateUsernameSchema,
  useAuth,
  useUpdateUsernameForm,
} from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { AuthShell } from "./auth-shell";
import {
  clearPendingRedirectTarget,
  getNextTarget,
} from "../constants";

function mapErrorToMessage(code: string) {
  switch (code) {
    case "validation_error":
    case "invalid_username":
      return "Use 3-32 characters with letters, numbers, dots, underscores, or hyphens.";
    case "username_taken":
      return "That username is already taken.";
    default:
      return "Could not save your username. Please try again.";
  }
}

type AvailabilityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; username: string }
  | { status: "taken"; username: string }
  | { status: "error" };

export function SetupUsernameScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, requiresUsername, checkUsernameAvailability } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityState>({ status: "idle" });
  const nextTarget = useMemo(
    () => getNextTarget(searchParams.get("next")),
    [searchParams],
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextTarget)}`);
      return;
    }

    if (!requiresUsername) {
      clearPendingRedirectTarget();
      window.location.assign(nextTarget);
    }
  }, [isAuthenticated, isLoading, nextTarget, requiresUsername, router]);

  const { form, submit } = useUpdateUsernameForm({
    onSuccess: () => {
      setError(null);
      clearPendingRedirectTarget();
      window.location.assign(nextTarget);
    },
    onError: (submitError) => {
      setError(mapErrorToMessage(getAuthErrorCode(submitError)));
    },
  });

  const usernameValue = form.watch("username");

  useEffect(() => {
    const trimmedUsername = usernameValue.trim();

    if (!trimmedUsername) {
      setAvailability({ status: "idle" });
      return;
    }

    const parsed = updateUsernameSchema.safeParse({ username: trimmedUsername });
    if (!parsed.success) {
      setAvailability({ status: "idle" });
      return;
    }

    setAvailability((current) => {
      if (
        current.status === "available" &&
        current.username === trimmedUsername
      ) {
        return current;
      }

      if (
        current.status === "taken" &&
        current.username === trimmedUsername
      ) {
        return current;
      }

      return { status: "idle" };
    });

    let active = true;
    const timer = window.setTimeout(async () => {
      setAvailability({ status: "checking" });

      try {
        const result = await checkUsernameAvailability(trimmedUsername);

        if (!active) return;

        setAvailability(
          result.available
            ? { status: "available", username: result.username }
            : { status: "taken", username: result.username },
        );
      } catch (requestError) {
        if (!active) return;

        if (getAuthErrorCode(requestError) === "invalid_username") {
          setAvailability({ status: "idle" });
          return;
        }

        setAvailability({ status: "error" });
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [checkUsernameAvailability, usernameValue]);

  function renderAvailabilityMessage() {
    switch (availability.status) {
      case "checking":
        return <p className="text-xs text-white/45">Checking availability...</p>;
      case "available":
        return <p className="text-xs text-emerald-400">Username is available.</p>;
      case "taken":
        return <p className="text-xs text-amber-400">That username is already taken.</p>;
      case "error":
        return <p className="text-xs text-red-400">Could not check username availability.</p>;
      default:
        return null;
    }
  }

  return (
    <AuthShell>
      <div className="w-full max-w-[430px] rounded-2xl border border-white/6 bg-[#121a2d] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:p-5">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold text-white">Final Step</h1>
          <p className="mt-2 text-sm text-white/55">Pick a username to get started.</p>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <label htmlFor="username" className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              Username
            </label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="wiper-r"
              className="h-11 border-white/8 bg-[#2a3350] text-white placeholder:text-white/25"
              {...form.register("username")}
            />
            {form.formState.errors.username?.message ? (
              <p className="text-xs text-red-400">{form.formState.errors.username.message}</p>
            ) : renderAvailabilityMessage()}
          </div>

          {error ? <p className="text-xs text-red-400">{error}</p> : null}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-sm font-semibold text-white hover:from-[#8b5cf6] hover:to-[#9f67ff]"
          >
            {form.formState.isSubmitting ? "Saving..." : "Get Started"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
