import { Suspense } from "react";
import { AuthCallbackHandler } from "@/features/login";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
