"use client";

import React, { createContext, useMemo, useState } from "react";
import { cx } from "@/components/ui/cx";

/**
 * The seven-layer stack every game state composes into (Phase 1 —
 * see docs/THUMBBAT_GAME_CLIENT_ARCHITECTURE.md Section 5.1, extended
 * with AtmosphereLayer/FeedbackLayer per the Phase 1 kickoff).
 *
 * Order is z-index order, back to front. `interaction` and `overlay` are
 * the only layers that take pointer events by default — everything else
 * is decorative and must not block taps to what's under it.
 */
export const LAYER_ORDER = [
  "world",
  "atmosphere",
  "hud",
  "interaction",
  "feedback",
  "overlay",
  "transition",
] as const;

export type LayerName = (typeof LAYER_ORDER)[number];

// Every layer container defaults to pointer-events-none, full stop —
// including interaction/overlay. A full-viewport `absolute inset-0` div
// with pointer-events:auto blocks every layer under it even while empty
// (an unopened OverlayLayer was silently eating every click meant for
// InteractionLayer during Phase 1 verification — see layerSlots.tsx for
// the actual fix: slot content opts back into pointer-events itself,
// the container never does).
const LAYER_CLASS: Record<LayerName, string> = {
  world: "absolute inset-0 z-0 pointer-events-none",
  atmosphere: "absolute inset-0 z-10 pointer-events-none",
  hud: "absolute inset-0 z-20 pointer-events-none",
  interaction: "absolute inset-0 z-30 pointer-events-none",
  feedback: "absolute inset-0 z-40 pointer-events-none",
  overlay: "absolute inset-0 z-50 pointer-events-none",
  transition: "absolute inset-0 z-[60] pointer-events-none",
};

export const LayerNodesContext = createContext<Partial<Record<LayerName, HTMLDivElement>>>({});

export interface GameClientShellProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * The single fullscreen game-client root. Fixed to the viewport (`100dvh`,
 * safe-area-agnostic — individual layers handle their own safe-area insets,
 * the shell itself just owns the stacking context) so nothing here ever
 * scrolls like a webpage.
 *
 * This component owns no game state and no socket/game logic — it is pure
 * composition. Descendants (anywhere in the tree, not just direct
 * children) reach a layer via the exported `<WorldLayer>`/`<HUDLayer>`/etc.
 * slot components in `layerSlots.tsx`, which portal into the matching div
 * here. This is what lets a future state component (Home, Gameplay, ...)
 * contribute to multiple layers without the shell's own props changing —
 * "possible without rewriting the shell," per the Phase 1 brief.
 */
export default function GameClientShell({ children, className }: GameClientShellProps) {
  const [nodes, setNodes] = useState<Partial<Record<LayerName, HTMLDivElement>>>({});

  // One stable callback per layer, built once. Passing a freshly-created
  // inline function as a `ref` on every render makes React detach+reattach
  // it every render (new identity = "different ref"), which — since attach
  // triggers this component's own setState — becomes an infinite
  // detach/attach/re-render loop. Memoizing the whole map up front (not
  // just the outer factory) is what actually fixes it.
  const registerNode = useMemo(() => {
    const map = {} as Record<LayerName, (el: HTMLDivElement | null) => void>;
    for (const layer of LAYER_ORDER) {
      map[layer] = (el: HTMLDivElement | null) => {
        setNodes((prev) => {
          if (el && prev[layer] !== el) return { ...prev, [layer]: el };
          if (!el && prev[layer]) {
            const next = { ...prev };
            delete next[layer];
            return next;
          }
          return prev;
        });
      };
    }
    return map;
  }, []);

  return (
    <div
      className={cx(
        "fixed inset-0 h-[100dvh] w-full overflow-hidden bg-black",
        className
      )}
    >
      {LAYER_ORDER.map((layer) => (
        <div key={layer} ref={registerNode[layer]} data-game-layer={layer} className={LAYER_CLASS[layer]} />
      ))}

      <LayerNodesContext.Provider value={nodes}>{children}</LayerNodesContext.Provider>
    </div>
  );
}
