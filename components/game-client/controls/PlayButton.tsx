"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import { cx } from "@/components/ui/cx";
import { playSfx } from "../services/audio";
import { haptic } from "../services/haptics";

export interface PlayButtonProps {
  onPlay: () => void;
  className?: string;
}

/**
 * THUMBBAT's PLAY control (Phase 2). Uses the shared `Button` as its
 * technical base (press mechanics, loading/disabled handling) per the
 * brief's explicit "use the existing shared button only as a technical
 * base if useful, but visually transform it" — the className below is a
 * full visual departure from Button's default `primary` look, not a
 * restyle of it.
 *
 * Idle: slow breathing scale + persistent glow (reduced-motion aware).
 * Hover/press: Button's own whileHover/whileTap.
 * Release: a quick scale-overshoot "punch" fired from this component,
 * distinct from the physical press compression.
 */
export default function PlayButton({ onPlay, className }: PlayButtonProps) {
  const reduceMotion = useReducedMotion();
  const [punchKey, setPunchKey] = useState(0);

  const handlePress = () => {
    haptic("medium");
    playSfx("button_press");
    setPunchKey((k) => k + 1);
    onPlay();
  };

  return (
    <motion.div
      key={punchKey}
      animate={
        reduceMotion
          ? undefined
          : punchKey > 0
            ? { scale: [1, 1.1, 1] }
            : { scale: [1, 1.02, 1] }
      }
      transition={
        punchKey > 0
          ? { duration: 0.28, ease: "easeOut" }
          : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <Button
        variant="primary"
        onClick={handlePress}
        className={cx(
          "px-16 py-5 text-2xl font-extrabold uppercase tracking-widest",
          "shadow-tb-button-primary hover:brightness-110",
          className
        )}
      >
        PLAY
      </Button>
    </motion.div>
  );
}
