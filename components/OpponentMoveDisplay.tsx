"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OpponentMoveDisplay({
  opponent,
  revealedMove,
}: {
  opponent: string;
  revealedMove: number | null;
}) {
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (typeof revealedMove === "number" && revealedMove !== lastMove) {
      setLastMove(revealedMove);
      setAnimKey((k) => k + 1);
    }
  }, [revealedMove, lastMove]);

  const waiting = revealedMove == null;
  const hasAny = lastMove !== null;

  return (
    <div
      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-white/70">{waiting ? "⏱ Waiting…" : `⏱ ${opponent} chose`}</span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={hasAny ? `mv-${animKey}-${lastMove}` : "pending"}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={[
            "inline-grid h-7 w-7 place-items-center rounded-lg font-bold tabular-nums",
            hasAny ? "bg-emerald-400 text-gray-900 shadow-[0_8px_30px_rgba(16,185,129,.35)]" : "bg-white/10 text-white/70",
          ].join(" ")}
        >
          {hasAny ? lastMove : "—"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}