"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthErrorCode, useVerifyEmailOTPForm } from "@repo/auth";
import { Button } from "@repo/ui/components/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/components/input-otp";
import { RedirectSplash } from "@/components/redirect-splash";
import { AuthShell } from "../components/auth-shell";
import { clearPendingRedirectTarget, getNextTarget } from "../constants";

type LoginOTPFormProps = {
  challengeId?: string | null;
  email?: string | null;
  next?: string | null;
};

function mapErrorToMessage(code: string) {
  switch (code) {
    case "otp_invalid":
      return "That code is invalid. Check the email and try again.";
    case "otp_expired":
      return "That code expired. Request a new one.";
    case "otp_too_many_tries":
      return "Too many attempts for this code. Request a new one.";
    case "validation_error":
      return "Enter the full 6-digit code.";
    default:
      return "Verification failed. Please try again.";
  }
}

export function LoginOTPForm({ challengeId, email, next }: LoginOTPFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const nextTarget = useMemo(() => getNextTarget(next), [next]);

  useEffect(() => {
    if (!challengeId) {
      router.replace(`/login?next=${encodeURIComponent(nextTarget)}`);
    }
  }, [challengeId, nextTarget, router]);

  const { form, submit } = useVerifyEmailOTPForm({
    defaultValues: {
      challenge_id: challengeId ?? "",
    },
    onSuccess: (user) => {
      setError(null);

      if (user.requires_username) {
        router.push(`/auth/setup-username?next=${encodeURIComponent(nextTarget)}`);
        return;
      }

      clearPendingRedirectTarget();
      setIsRedirecting(true);
      window.location.assign(nextTarget);
    },
    onError: (submitError) => {
      setError(mapErrorToMessage(getAuthErrorCode(submitError)));
    },
  });

  if (isRedirecting) {
    return <RedirectSplash />;
  }

  return (
    <AuthShell>
      <div className="w-full max-w-[430px] rounded-2xl border border-white/6 bg-[#121a2d] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:p-5">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold text-white">Verify Email Code</h1>
          <p className="mt-2 text-sm text-white/55">
            {email ? `Enter the code sent to ${email}.` : "Enter the 6-digit code we sent to your email."}
          </p>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <input type="hidden" {...form.register("challenge_id")} />

          <div className="grid gap-3 justify-items-center">
            <InputOTP
              maxLength={6}
              value={form.watch("code")}
              onChange={(value) => form.setValue("code", value, { shouldValidate: true })}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((slot) => (
                  <InputOTPSlot
                    key={slot}
                    index={slot}
                    className="border-white/10 bg-[#2a3350] text-white"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {form.formState.errors.code?.message ? (
              <p className="text-xs text-red-400">{form.formState.errors.code.message}</p>
            ) : null}
          </div>

          {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-sm font-semibold text-white hover:from-[#8b5cf6] hover:to-[#9f67ff]"
          >
            {form.formState.isSubmitting ? "Verifying..." : "Continue"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-white/40">
          Need a new code?
          {" "}
          <Link href={`/login?next=${encodeURIComponent(nextTarget)}`} className="text-white/65 underline">
            Go back
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
