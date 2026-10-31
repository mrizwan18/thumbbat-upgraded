"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import { cx } from "@/components/ui/cx";
import { PLAYER_IDLE, OPP_IDLE } from "@/lib/getMoveImage";

/**
 * A presentation-only miniature of the actual ThumbBat game HUD, for the
 * landing page hero (Sprint 2).
 *
 * This is NOT connected to sockets, useGameSocket, or useBotGame — every
 * number/name/score here is static dressing meant to look like a real
 * in-progress match. It intentionally reuses the same idle hand artwork
 * (`PLAYER_IDLE`/`OPP_IDLE`) the real game board renders, rather than
 * inventing new imagery, so the preview reads as "the actual game" and not
 * a generic app screenshot.
 */
export default function GamePreview() {
  const reduce = useReducedMotion();

  return (
    <Card
      variant="elevated"
      className="relative w-full max-w-md overflow-hidden p-5 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-tb-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-tb-secondary/10 blur-3xl"
      />

      {/* HUD header: players + live score */}
      <div className="relative flex items-center justify-between gap-3">
        <PlayerChip label="YOU" score={4} tone="primary" active />
        <span className="text-xs font-bold text-tb-text-muted">VS</span>
        <PlayerChip label="RIZZWON" score={2} tone="secondary" />
      </div>

      {/* arena */}
      <div className="relative mt-4 flex items-center justify-center gap-8 rounded-tb-lg border border-tb-border-subtle bg-tb-bg-elevated/60 py-7">
        <motion.div
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        >
          <Image src={PLAYER_IDLE} alt="" width={64} height={64} className="select-none" />
        </motion.div>
        <motion.div
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.5 }}
        >
          <Image src={OPP_IDLE} alt="" width={64} height={64} className="select-none" />
        </motion.div>
      </div>

      {/* status */}
      <p className="relative mt-3 text-center text-tb-caption font-semibold uppercase tracking-wide text-tb-primary">
        Your turn &middot; pick a number
      </p>

      {/* decorative number picker — static, not interactive */}
      <div className="relative mt-3 grid grid-cols-6 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span
            key={n}
            className={cx(
              "flex h-8 items-center justify-center rounded-tb-sm text-sm font-bold tabular-nums",
              n === 4 ? "bg-tb-primary text-tb-bg-elevated" : "bg-white/5 text-tb-text-secondary"
            )}
          >
            {n}
          </span>
        ))}
      </div>
    </Card>
  );
}

function PlayerChip({
  label,
  score,
  tone,
  active,
}: {
  label: string;
  score: number;
  tone: "primary" | "secondary";
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cx(
          "inline-grid h-8 w-8 place-items-center rounded-tb-pill text-xs font-extrabold text-tb-bg-elevated",
          tone === "primary" ? "bg-tb-primary" : "bg-tb-secondary",
          active && "ring-2 ring-tb-primary/50"
        )}
      >
        {label[0]}
      </span>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-tb-text-muted">
          {label}
        </div>
        <div className="text-lg font-extrabold tabular-nums text-tb-text-primary">{score}</div>
      </div>
    </div>
  );
}
