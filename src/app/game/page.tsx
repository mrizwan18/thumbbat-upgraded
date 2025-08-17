import { Suspense } from "react";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic"; // optional: avoids SSG for this page
// export const revalidate = 0;          // optional alternative

export default function GamePage() {
  return (
    <Suspense fallback={<div className="p-6 text-white/70">Loading game…</div>}>
      <GameClient />
    </Suspense>
  );
}