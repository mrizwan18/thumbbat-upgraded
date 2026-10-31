import React from "react";
import Image from "next/image";
import { cx } from "./cx";
import { ASSET_SLOTS, type AssetSlotKey } from "./assetContract";

export interface ArtSlotProps {
  /** Which asset-contract slot this fills — sets the reserved aspect ratio. */
  slot: AssetSlotKey;
  /** Real asset URL, once supplied. Omit to render the placeholder. */
  src?: string;
  alt: string;
  /** Passed through to next/image — set for above-the-fold usage only. */
  priority?: boolean;
  className?: string;
}

/**
 * A media slot that reserves its final aspect ratio whether or not the real
 * asset exists yet (Sprint 6's "asset contract" requirement — no layout
 * shift when `src` is dropped in later).
 *
 * Deliberately does NOT draw a fake character or scene when `src` is
 * missing — just a neutral, evenly-lit placeholder shape, so nobody
 * mistakes it for a real design decision.
 */
export default function ArtSlot({ slot, src, alt, priority, className }: ArtSlotProps) {
  const { aspect } = ASSET_SLOTS[slot];

  return (
    <div
      className={cx("relative w-full overflow-hidden rounded-tb-lg bg-tb-surface", className)}
      style={{ aspectRatio: String(aspect) }}
    >
      {src ? (
        <Image src={src} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(167,139,250,0.16),transparent_65%)]"
        >
          <svg viewBox="0 0 24 24" className="h-1/4 w-1/4 text-tb-text-muted" fill="none">
            <circle cx="12" cy="7" r="3.4" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M4.5 20c0-3.6 3.36-6.2 7.5-6.2s7.5 2.6 7.5 6.2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
