/**
 * The generalized asset-slot system from
 * docs/THUMBBAT_GAME_CLIENT_ARCHITECTURE.md Section 5.4 — one manifest,
 * one generic shape, not five bespoke components. Fresh implementation
 * for the game-client tree; Sprint 6's `assetContract.ts`/`ArtSlot.tsx`
 * were explicitly discarded with the rest of the pre-reset UI, not
 * reused.
 *
 * Every slot here is real product data (kind + reserved aspect ratio),
 * not a stand-in. Until a real `src` lands, each consumer decides for
 * itself whether "no asset yet" means a reserved-but-invisible space
 * (non-flow decorative elements like characters — nothing to reserve
 * against) or a code-generated fallback (the arena background, which
 * already has its own atmospheric treatment either way). See
 * `ArenaWorld.tsx` and `PHASE_2_HOME.md` for which is which and why.
 */
export type AssetKind = "image" | "video" | "lottie" | "sprite-sheet";

export interface AssetSlotSpec {
  kind: AssetKind;
  /** Real asset URL once supplied. Absent = no asset yet. */
  src?: string;
  /** width / height, reserved so a later src doesn't shift anything that's actually in flow. */
  aspect: number;
  poster?: string;
  resolutions?: { mobile?: string; desktop?: string };
  usage: string;
}

export type AssetSlotKey =
  | "arenaHome"
  | "characterPlayer"
  | "characterOpponent"
  | "cricketBall";

export const ASSET_MANIFEST: Record<AssetSlotKey, AssetSlotSpec> = {
  arenaHome: {
    kind: "image",
    aspect: 9 / 16,
    usage: "Home WorldLayer background. Portrait-first; resolutions.desktop for wider viewports.",
  },
  characterPlayer: {
    kind: "image",
    aspect: 3 / 4,
    usage: "Home world foreground — generic 'you' athlete, transparent background, non-flow decorative.",
  },
  characterOpponent: {
    kind: "image",
    aspect: 3 / 4,
    usage: "Home world foreground — generic 'opponent' athlete, transparent background, non-flow decorative.",
  },
  cricketBall: {
    kind: "image",
    aspect: 1,
    usage: "Small decorative accent near the wordmark/PLAY cluster. Code-drawn SVG stands in for now (see ArenaWorld.tsx) — this slot exists for a higher-fidelity render later.",
  },
};
