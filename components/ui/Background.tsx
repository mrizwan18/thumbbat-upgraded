"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BackgroundVariant = "website" | "game";

/**
 * The ThumbBat background (Sprint 1).
 *
 * One reusable implementation replacing the several near-identical
 * "glow + grid" background blocks the audit found duplicated inline across
 * Landing/Login/Leaderboard/GameShell. This sprint only wires it into
 * `components/game/GameShell.tsx` (per the sprint brief) — the website
 * pages keep their existing inline backgrounds for now and can adopt this
 * in their own redesign sprints.
 *
 * Fixed + -z-10 so it sits behind all content regardless of scroll, is
 * restrained (one glow, one faint grid, one slow-moving accent blob), and
 * disables the looping accent motion under prefers-reduced-motion.
 */
export function AppBackground({ variant = "website" }: { variant?: BackgroundVariant }) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-tb-bg"
    >
      <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,_rgba(47,216,169,0.16),_transparent)] sm:h-[42rem] sm:w-[42rem]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:42px_42px]" />

      {variant === "game" && (
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,124,246,0.10),_transparent_70%)]" />
      )}

      {!reduce && (
        <motion.div
          className="absolute right-10 top-24 h-48 w-48 rounded-full bg-tb-primary/10 blur-3xl"
          animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

export default AppBackground;
