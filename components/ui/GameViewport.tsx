import React from "react";
import { cx } from "./cx";

/**
 * The ThumbBat "game canvas" layout primitive (Sprint 5).
 *
 * Full-bleed atmospheric background behind a centered, phone-proportioned
 * content column. At mobile widths the capped column effectively *is* the
 * viewport (no separate mobile implementation needed); at desktop widths it
 * keeps the boot experience reading as a game viewport rather than a website
 * stretching to fill the browser — deliberately never `max-w-7xl`.
 *
 * The background here is intentionally minimal — a solid deep-navy base
 * plus one faint radial tint, no grid, no floating blobs. This is a
 * *temporary* atmospheric base per Sprint 5's scope; the illustrated
 * stadium/pitch environment arrives in Sprint 6.
 */
export default function GameViewport({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-tb-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(47,216,169,0.07),transparent_55%)]"
      />
      <div
        className={cx(
          "relative z-10 mx-auto flex min-h-[100svh] w-full max-w-sm flex-col sm:max-w-md",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
