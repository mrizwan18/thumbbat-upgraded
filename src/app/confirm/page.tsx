/**
 * @deprecated Email confirmation is no longer used — ThumbBat now only
 * supports Google sign-in. Left in place rather than deleted; do not
 * build new features on this path.
 */
import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";
export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <ConfirmClient />
    </Suspense>
  );
}
