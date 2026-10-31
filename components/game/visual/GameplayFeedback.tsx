"use client";

import React from "react";
import { motion } from "framer-motion";
import { cx } from "@/components/ui/cx";

export type FeedbackTone = "positive" | "negative" | "neutral" | "critical";

export interface GameplayFeedbackProps {
  text: string;
  tone?: FeedbackTone;
  className?: string;
  /** Fires once the pop → hold → fade sequence finishes — the cue for a parent to unmount this. */
  onComplete?: () => void;
}

const TONE_CLASS: Record<FeedbackTone, string> = {
  positive: "text-tb-mint drop-shadow-[0_0_18px_var(--tb-glow-mint)]",
  critical: "text-tb-cyan drop-shadow-[0_0_18px_var(--tb-glow-cyan)]",
  negative: "text-tb-ball-red drop-shadow-[0_0_16px_rgba(140,58,58,0.55)]",
  neutral: "text-tb-text-primary drop-shadow-[0_0_14px_rgba(167,139,250,0.4)]",
};

/**
 * Momentary big gameplay feedback ("FOUR!", "OUT!", "CRITICAL!") — Sprint 6
 * primitive. Deliberately NOT persistent HUD text: this component owns only
 * the pop → hold → fade animation, not its own lifetime. A parent mounts it
 * (typically inside `AnimatePresence`) when a round result arrives and
 * removes it after `onComplete` fires (~1.1s total).
 *
 * Sequence per the brief: opacity 0 → scale .75 → scale 1.08 → scale 1,
 * hold, then fade — implemented as one keyframed `animate`, not a chained
 * multi-step imperative animation, so it stays cheap (transform/opacity
 * only, no layout-triggering properties).
 */
export default function GameplayFeedback({
  text,
  tone = "positive",
  className,
  onComplete,
}: GameplayFeedbackProps) {
  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.75, 1.08, 1, 1] }}
      transition={{ duration: 1.1, times: [0, 0.3, 0.75, 1], ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className={cx(
        "select-none whitespace-nowrap text-tb-feedback uppercase tracking-tight",
        TONE_CLASS[tone],
        className
      )}
    >
      {text}
    </motion.p>
  );
}
