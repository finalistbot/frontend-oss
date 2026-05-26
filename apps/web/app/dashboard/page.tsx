import { Suspense } from "react";
import { AuthCallbackHandler } from "@/features/login";

export default function DashboardRedirectPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
