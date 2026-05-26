"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthErrorCode, useAuth, useRequestEmailOTPForm } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { DiscordIcon, GoogleIcon, MailIcon } from "@repo/ui/components/provider-icons";
import { RedirectSplash } from "@/components/redirect-splash";
import { AuthShell } from "../components/auth-shell";
import {
  buildOAuthLoginUrl,
  clearPendingRedirectTarget,
  getNextTarget,
  storePendingRedirectTarget,
} from "../constants";

type LoginFormProps = {
  next?: string | null;
};

function mapErrorToMessage(code: string) {
  switch (code) {
    case "validation_error":
      return "Enter a valid email address.";
    case "otp_rate_limited":
      return "Too many codes requested. Please wait before trying again.";
    case "email_delivery_off":
      return "Email sign-in is not available right now.";
    default:
      return "We could not send the OTP. Please try again.";
  }
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, requiresUsername } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const nextTarget = getNextTarget(next);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    if (requiresUsername) {
      router.replace(`/auth/setup-username?next=${encodeURIComponent(nextTarget)}`);
      return;
    }

    clearPendingRedirectTarget();
    setIsRedirecting(true);
    window.location.assign(nextTarget);
  }, [isAuthenticated, isLoading, nextTarget, requiresUsername, router]);

  const { form, submit } = useRequestEmailOTPForm({
    onSuccess: (result) => {
      setError(null);
      const email = form.getValues("email");
      router.push(
        `/verify?challenge_id=${encodeURIComponent(result.challenge_id)}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextTarget)}`,
      );
    },
    onError: (submitError) => {
      setError(mapErrorToMessage(getAuthErrorCode(submitError)));
    },
  });

  function startOAuth(provider: "google" | "discord") {
    storePendingRedirectTarget(nextTarget);
    window.location.assign(buildOAuthLoginUrl(provider));
  }

  if (isRedirecting) {
    return <RedirectSplash />;
  }

  return (
    <AuthShell>
      <div className="w-full max-w-[430px] rounded-2xl border border-white/6 bg-[#121a2d] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:p-5">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-white/55">
            Sign in once in web, then continue directly into play or manage.
          </p>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => startOAuth("discord")}
            className="flex h-12 items-center justify-center gap-3 rounded-md bg-[#5865f2] text-sm font-semibold text-white transition hover:brightness-110"
          >
            <DiscordIcon aria-hidden="true" />
            Login With Discord
          </button>

          <button
            type="button"
            onClick={() => startOAuth("google")}
            className="flex h-12 items-center justify-center gap-3 rounded-md bg-white text-sm font-semibold text-[#111827] transition hover:bg-white/90"
          >
            <GoogleIcon aria-hidden="true" />
            Login With Google
          </button>

          <button
            type="button"
            onClick={() => setShowEmailForm((value) => !value)}
            className="flex h-12 items-center justify-center gap-3 rounded-md bg-[#2a2a2a] text-sm font-semibold text-white transition hover:bg-[#353535]"
          >
            <MailIcon aria-hidden="true" />
            Login With Email
          </button>
        </div>

        {showEmailForm ? (
          <form className="mt-5 grid gap-3" onSubmit={submit}>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 border-white/8 bg-[#2a3350] text-white placeholder:text-white/25"
                {...form.register("email")}
              />
              {form.formState.errors.email?.message ? (
                <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-sm font-semibold text-white hover:from-[#8b5cf6] hover:to-[#9f67ff]"
            >
              {form.formState.isSubmitting ? "Sending code..." : "Send Email Code"}
            </Button>
          </form>
        ) : null}

        <p className="mt-5 text-center text-xs text-white/40">
          Email sign-in creates the account automatically on first verification.
          {" "}
          <Link href={`/verify?next=${encodeURIComponent(nextTarget)}`} className="text-white/65 underline">
            Already have a code?
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
