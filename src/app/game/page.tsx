"use client";

import React, { Suspense } from "react";
import GameScreen from "./GameScreen";

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100svh] grid place-items-center bg-gray-950 text-white">
          <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
            Loading game…
          </div>
        </div>
      }
    >
      <GameScreen />
    </Suspense>
  );
}