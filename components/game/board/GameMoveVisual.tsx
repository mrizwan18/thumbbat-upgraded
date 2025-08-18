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
  bounceMs = 850, // fist bounce duration before reveal
  size = 140, // image box size (px)
}: {
  playerMove: number | null; // 1..6 (null = no reveal yet)
  opponentMove: number | null; // 1..6 (null = no reveal yet)
  bounceMs?: number;
  size?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload all assets once (browser only)
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
      // decode speeds up paint where supported
      (img as any).decode?.().catch(() => {});
    });
  }, []);

  // When both moves arrive → bounce fists → reveal both
  useEffect(() => {
    const bothHaveMoves = playerMove != null && opponentMove != null;
    if (bothHaveMoves) {
      if (prefersReducedMotion) {
        setPhase("reveal");
        return;
      }
      setPhase("bouncing");
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
      bounceTimer.current = setTimeout(() => setPhase("reveal"), bounceMs);
    } else {
      setPhase("idle");
    }
    return () => {
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
    };
  }, [playerMove, opponentMove, bounceMs, prefersReducedMotion]);

  const boxStyle = useMemo(() => ({ width: size, height: size }), [size]);

  const showPlayerSrc =
    phase === "reveal" && playerMove ? PLAYER_MOVE_SRC[playerMove] : PLAYER_IDLE;
  const showOppSrc =
    phase === "reveal" && opponentMove ? OPP_MOVE_SRC[opponentMove] : OPP_IDLE;

  // Compact bounce keyframes
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
  // <img> for fastest decode; container sets size
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