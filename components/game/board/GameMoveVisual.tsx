"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  PLAYER_MOVE_SRC,
  OPP_MOVE_SRC,
  PLAYER_IDLE,
  OPP_IDLE,
} from "@/lib/getMoveImage";

type Phase = "idle" | "bouncing" | "reveal";

export default function GameMoveVisual({
  playerMove,
  opponentMove,
  bounceMs = 900, // ~2 bounces
  size = 140,
}: {
  playerMove: number | null;     // 1..6 (null = no move this round)
  opponentMove: number | null;   // 1..6 (null = no move this round)
  bounceMs?: number;
  size?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");

  // What we are currently *showing* on screen (persists between rounds)
  const [displayed, setDisplayed] = useState<{ player: number | null; opp: number | null }>({
    player: null,
    opp: null,
  });

  // Track which pair we last revealed (to detect a new round)
  const lastPairKeyRef = useRef<string | null>(null);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload assets once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const toPreload = [
      PLAYER_IDLE,
      OPP_IDLE,
      ...Object.values(PLAYER_MOVE_SRC),
      ...Object.values(OPP_MOVE_SRC),
    ];
    toPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
      (img as any).decode?.().catch(() => {});
    });
  }, []);

  // Orchestrate: on a new pair -> bounce (over current images) -> swap to new pair -> reveal
  useEffect(() => {
    const bothHaveMoves = playerMove != null && opponentMove != null;

    if (bothHaveMoves) {
      const newKey = `${playerMove}-${opponentMove}`;
      if (newKey !== lastPairKeyRef.current) {
        // New round's pair
        if (prefersReducedMotion) {
          setDisplayed({ player: playerMove!, opp: opponentMove! });
          setPhase("reveal");
          lastPairKeyRef.current = newKey;
          return;
        }

        setPhase("bouncing"); // bounce over whatever is currently displayed
        if (bounceTimer.current) clearTimeout(bounceTimer.current);
        bounceTimer.current = setTimeout(() => {
          setDisplayed({ player: playerMove!, opp: opponentMove! });
          setPhase("reveal");
          lastPairKeyRef.current = newKey;
        }, bounceMs);
      } else {
        // Same pair already shown → ensure reveal stays
        setPhase("reveal");
      }
    } else {
      // Not a full pair this moment:
      // If we've never revealed anything, show idle; otherwise keep the last reveal visible.
      if (displayed.player == null && displayed.opp == null) {
        setPhase("idle");
      } else {
        setPhase("reveal");
      }
    }

    return () => {
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
    };
  }, [playerMove, opponentMove, bounceMs, prefersReducedMotion, displayed.player, displayed.opp]);

  const boxStyle = useMemo(() => ({ width: size, height: size }), [size]);

  const showPlayerSrc =
    displayed.player != null ? PLAYER_MOVE_SRC[displayed.player] : PLAYER_IDLE;
  const showOppSrc =
    displayed.opp != null ? OPP_MOVE_SRC[displayed.opp] : OPP_IDLE;

  const fistBounceAnim =
    phase === "bouncing"
      ? {
          y: [0, -12, 0, -6, 0],
          transition: {
            duration: bounceMs / 1000,
            times: [0, 0.35, 0.55, 0.8, 1],
            ease: "easeInOut",
          },
        }
      : {};

  return (
    <div className="flex items-center justify-center gap-10 my-4">
      {/* Player hand (left) */}
      <motion.div style={boxStyle} animate={fistBounceAnim}>
        <ImageBox src={showPlayerSrc} alt="Your hand" />
      </motion.div>

      {/* Opponent hand (right) */}
      <motion.div style={boxStyle} animate={fistBounceAnim}>
        <ImageBox src={showOppSrc} alt="Opponent hand" />
      </motion.div>
    </div>
  );
}

function ImageBox({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-full w-full grid place-items-center">
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt={alt}
          className="max-h-full max-w-full select-none"
          draggable={false}
          initial={{ opacity: 0.001 }}
          animate={{ opacity: 1, transition: { duration: 0.12 } }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
          style={{
            filter: "drop-shadow(0 10px 24px rgba(0,0,0,.35))",
            imageRendering: "auto",
          }}
        />
      </AnimatePresence>
    </div>
  );
}