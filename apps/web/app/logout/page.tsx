import { Suspense } from "react";
import LogoutPageClient from "./logout-page-client";

export default function LogoutPage() {
  return (
    <Suspense fallback={null}>
      <LogoutPageClient />
    </Suspense>
  );
}
