"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PLAYER_MOVE_SRC, OPP_MOVE_SRC, PLAYER_IDLE, OPP_IDLE } from "@/lib/getMoveImage";

type Phase = "idle" | "bouncing" | "reveal";

export default function GameMoveVisual({
  playerMove,
  opponentMove,
  bounceMs = 900,
  size = 140,
}: {
  playerMove: number | null;
  opponentMove: number | null;
  bounceMs?: number;
  size?: number;
}) {
  const rPref = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");

  // Sticky cache of the last *fully-formed* pair we revealed
  const [revealMoves, setRevealMoves] = useState<{ player: number | null; opp: number | null }>({
    player: null,
    opp: null,
  });

  // Track the last pair that triggered animations so we only re-bounce on change
  const lastPairRef = useRef<string>("__none__");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // preload (browser only)
    if (typeof window === "undefined") return;
    [...Object.values(PLAYER_MOVE_SRC), ...Object.values(OPP_MOVE_SRC), PLAYER_IDLE, OPP_IDLE].forEach(
      (src) => {
        const img = new Image();
        img.src = src;
        (img as any).decode?.().catch(() => {});
      }
    );
  }, []);

  useEffect(() => {
    const both = playerMove != null && opponentMove != null;
    const pairKey = both ? `${playerMove}-${opponentMove}` : "__incomplete__";
    const changed = pairKey !== lastPairRef.current;

    // Don’t interrupt an ongoing reveal with nulls; wait for a new pair
    if (both && changed) {
      lastPairRef.current = pairKey;
      setRevealMoves({ player: playerMove!, opp: opponentMove! });

      if (rPref) {
        setPhase("reveal");
        return;
      }
      setPhase("bouncing");
      clearTimers();
      timers.current.push(setTimeout(() => setPhase("reveal"), bounceMs));
    }
    // If not both: do nothing (keep the revealed images on screen)
    return clearTimers;
  }, [playerMove, opponentMove, bounceMs, rPref]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  const boxStyle = useMemo(() => ({ width: size, height: size }), [size]);
  const showPlayerSrc = revealMoves.player != null ? PLAYER_MOVE_SRC[revealMoves.player] : PLAYER_IDLE;
  const showOppSrc = revealMoves.opp != null ? OPP_MOVE_SRC[revealMoves.opp] : OPP_IDLE;

  const fistBounceAnim =
    phase === "bouncing"
      ? {
          y: [0, -12, 0, -6, 0],
          transition: { duration: bounceMs / 1000, times: [0, 0.35, 0.55, 0.8, 1], ease: "easeInOut" },
        }
      : {};

  return (
    <div className="flex items-center justify-center gap-10 my-4">
      <motion.div style={boxStyle} animate={fistBounceAnim}>
        <ImageBox src={showPlayerSrc} alt="Your hand" />
      </motion.div>
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
          style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,.35))" }}
        />
      </AnimatePresence>
    </div>
  );
}