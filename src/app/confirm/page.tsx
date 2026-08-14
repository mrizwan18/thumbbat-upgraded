/**
 * @deprecated Email confirmation is no longer used — ThumbBat now only
 * supports Google sign-in. Left in place rather than deleted; do not
 * build new features on this path.
 */
import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";
export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100svh] bg-tb-bg text-tb-text-secondary grid place-items-center">
          Loading…
        </div>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}