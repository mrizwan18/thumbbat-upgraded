"use client";

import React, { Suspense, useEffect, useState } from "react";
import GameClient from "@/components/game-client/GameClient";

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="min-h-[100svh] bg-gray-950 text-white grid place-items-center">
        <div className="animate-pulse text-white/60">Loading game…</div>
      </div>
    );
  }
  return <>{children}</>;
}

/**
 * /game (Phase 2 — game-client frontend reset). Renders through
 * `GameClient`, which owns the exact same `useGameSocket()`/
 * `useBotGame()`/`useAuthGuard()` hooks the old `GameScreenInner` did —
 * this file is now just the route/hydration boundary, per the
 * architectural rule that Home (and everything else) renders through
 * `GameClientShell`, not a second independent page tree.
 *
 * The pre-reset implementation (`GameShell`, `GameHomeScreen`, `TossOverlay`,
 * `GameBoard`, `GameOverModal`, ...) is intentionally left in place,
 * unimported — see docs/THUMBBAT_GAME_CLIENT_ARCHITECTURE.md Section 3.
 */
export default function GameScreenClient() {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <GameClient />
      </Suspense>
    </ClientOnly>
  );
}
