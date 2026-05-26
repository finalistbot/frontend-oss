"use client";

import { useSearchParams } from "next/navigation";
import { LoginOTPForm } from "@/features/login";

export default function VerifyPageClient() {
  const searchParams = useSearchParams();

  return (
    <LoginOTPForm
      challengeId={searchParams.get("challenge_id")}
      email={searchParams.get("email")}
      next={searchParams.get("next")}
    />
  );
}
