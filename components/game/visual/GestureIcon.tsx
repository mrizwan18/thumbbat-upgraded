"use client";

import React from "react";
import { motion } from "framer-motion";
import { cx } from "@/components/ui/cx";
import { durations } from "@/components/ui/motion";

export type GestureValue = 1 | 2 | 3 | 4 | 5 | 6;
export type GestureState = "default" | "hover" | "selected" | "disabled" | "revealed";

export interface GestureIconProps {
  value: GestureValue;
  state?: GestureState;
  size?: number;
  className?: string;
}

interface Capsule {
  x: number;
  y: number;
  rot: number;
  w: number;
  h: number;
}

const PALM: Capsule = { x: 32, y: 44, rot: 0, w: 26, h: 20 };
const THUMB: Capsule = { x: 12, y: 39, rot: -42, w: 8, h: 17 };
const THUMB_2: Capsule = { x: 52, y: 39, rot: 42, w: 8, h: 17 };
const SINGLE_FINGER: Capsule = { x: 32, y: 11, rot: 0, w: 8, h: 26 };
const FINGER_A: Capsule = { x: 19, y: 22, rot: -16, w: 7, h: 20 };
const FINGER_B: Capsule = { x: 28, y: 13, rot: -5, w: 7, h: 24 };
const FINGER_C: Capsule = { x: 38, y: 13, rot: 5, w: 7, h: 24 };
const FINGER_D: Capsule = { x: 47, y: 22, rot: 16, w: 7, h: 20 };

/**
 * ThumbBat's own gesture geometry (Sprint 6), built from a consistent
 * capsule-cluster hand system, NOT literal illustrated fingers — same
 * stroke weight/proportions at every value, and deliberately unlike
 * rock-paper-scissors (three discrete shapes) or a counting-fingers emoji.
 *
 * A thumb capsule is present in every value (1 is a bare fist + thumb —
 * the "thumb" identity carried through the whole system); fingers are
 * added progressively; 6 is the only value with a second thumb, so it
 * reads as "the bonus digit" rather than a generic sixth finger.
 */
const LAYOUT: Record<GestureValue, Capsule[]> = {
  1: [PALM, THUMB],
  2: [PALM, THUMB, SINGLE_FINGER],
  3: [PALM, THUMB, FINGER_B, FINGER_C],
  4: [PALM, THUMB, FINGER_A, FINGER_B, FINGER_C],
  5: [PALM, THUMB, FINGER_A, FINGER_B, FINGER_C, FINGER_D],
  6: [PALM, THUMB, THUMB_2, FINGER_A, FINGER_B, FINGER_C, FINGER_D],
};

const STATE_STROKE: Record<GestureState, string> = {
  default: "stroke-tb-mint",
  hover: "stroke-tb-mint",
  selected: "stroke-tb-mint",
  disabled: "stroke-tb-text-muted",
  revealed: "stroke-tb-mint",
};

const STATE_FILL: Record<GestureState, string> = {
  default: "fill-tb-surface",
  hover: "fill-tb-surface-elevated",
  selected: "fill-tb-mint/15",
  disabled: "fill-tb-surface",
  revealed: "fill-tb-mint/15",
};

export default function GestureIcon({ value, state = "default", size = 56, className }: GestureIconProps) {
  const capsules = LAYOUT[value];
  const isSelected = state === "selected";
  const isRevealed = state === "revealed";
  const isDisabled = state === "disabled";

  return (
    <motion.div
      className={cx(
        "inline-flex items-center justify-center rounded-tb-lg border-2",
        isDisabled ? "border-tb-border-subtle opacity-50" : "border-tb-mint/40",
        isSelected && "shadow-tb-glow-mint border-tb-mint",
        isRevealed && "shadow-tb-glow-mint",
        className
      )}
      style={{ width: size, height: size }}
      animate={
        isSelected
          ? { scale: [1.06, 1.1, 1.06] }
          : isRevealed
            ? { scale: [1, 1.18, 1] }
            : { scale: 1 }
      }
      transition={
        isSelected
          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          : isRevealed
            ? { duration: durations.impact }
            : { duration: durations.micro }
      }
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        {capsules.map((c, i) => (
          <rect
            key={i}
            x={c.x - c.w / 2}
            y={c.y - c.h / 2}
            width={c.w}
            height={c.h}
            rx={Math.min(c.w, c.h) / 2}
            transform={`rotate(${c.rot} ${c.x} ${c.y})`}
            className={cx(STATE_FILL[state], STATE_STROKE[state])}
            strokeWidth={2.5}
          />
        ))}
      </svg>
    </motion.div>
  );
}
