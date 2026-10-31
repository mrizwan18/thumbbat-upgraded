"use client";

import { useMemo, useState, useCallback } from "react";
import { deriveGameClientState } from "./deriveGameClientState";
import type { GameClientState, GameClientStateInput, OverlayState } from "./types";

export interface UseGameClientStateResult {
  state: GameClientState;
  overlay: OverlayState;
  openOverlay: (overlay: Exclude<OverlayState, null>) => void;
  closeOverlay: () => void;
}

/**
 * Thin React wrapper around `deriveGameClientState`. The overlay toggle is
 * the one piece of state this hook actually owns — everything else is
 * read from `input`, which the caller builds from the real
 * `useGameSocket()`/`useBotGame()` hooks (see the Phase 1 verification
 * route for the wiring). Recomputes only when an input actually changes.
 */
export function useGameClientState(input: GameClientStateInput): UseGameClientStateResult {
  const [overlay, setOverlay] = useState<OverlayState>(null);

  const state = useMemo(() => deriveGameClientState(input, overlay), [input, overlay]);

  const openOverlay = useCallback((next: Exclude<OverlayState, null>) => setOverlay(next), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  return { state, overlay, openOverlay, closeOverlay };
}
