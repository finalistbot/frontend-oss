import { Suspense } from "react";
import { SetupUsernameScreen } from "@/features/login";

export default function AuthSetupUsernamePage() {
  return (
    <Suspense fallback={null}>
      <SetupUsernameScreen />
    </Suspense>
  );
}
