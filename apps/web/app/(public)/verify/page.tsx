import { Suspense } from "react";
import VerifyPageClient from "./verify-page-client";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageClient />
    </Suspense>
  );
}

