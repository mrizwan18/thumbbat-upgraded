/**
 * ThumbBat art asset contract (Sprint 6).
 *
 * The visual-direction reference (`docs/design/ref.png`) includes fully
 * illustrated characters and a photo-quality stadium hero background that
 * cannot be produced in code. This is the manifest of every such asset the
 * rebuild needs, and the exact slot (aspect ratio) each one must fill so
 * that dropping in the real file later is a prop change, not a layout
 * change. Until a `src` is supplied, `ArtSlot` (see ArtSlot.tsx) renders a
 * neutral placeholder at this same aspect ratio — never a fake illustrated
 * stand-in.
 */
export type AssetSlotKey =
  | "heroArena"
  | "characterA"
  | "characterB"
  | "resultVictoryBg"
  | "resultDefeatBg";

export interface AssetSlotSpec {
  /** Suggested filename once supplied, under public/media/art/. */
  file: string;
  /** width / height, used to reserve layout space (no CLS on drop-in). */
  aspect: number;
  /** Human description of where this is consumed. */
  usage: string;
}

export const ASSET_SLOTS: Record<AssetSlotKey, AssetSlotSpec> = {
  heroArena: {
    file: "hero-arena.webp",
    aspect: 9 / 16,
    usage: "Game Home hero background (Sprint 7). Portrait-first; a wider crop can be supplied for desktop.",
  },
  characterA: {
    file: "character-a.png",
    aspect: 3 / 4,
    usage: "Gameplay HUD + Game Home — generic 'you' athlete cutout (Sprints 7 & 10), transparent background.",
  },
  characterB: {
    file: "character-b.png",
    aspect: 3 / 4,
    usage: "Gameplay HUD + Game Home — generic 'opponent' athlete cutout (Sprints 7 & 10), transparent background.",
  },
  resultVictoryBg: {
    file: "result-victory-bg.webp",
    aspect: 9 / 16,
    usage: "Result screen backdrop, win variant (Sprint 11).",
  },
  resultDefeatBg: {
    file: "result-defeat-bg.webp",
    aspect: 9 / 16,
    usage: "Result screen backdrop, loss/walkover variant (Sprint 11).",
  },
};
