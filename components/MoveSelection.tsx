"use client";

import { motion } from "framer-motion";
import React from "react";

export default function MoveSelection({
  playerMove,
  onPick,
  disabled = false,
}: {
  playerMove: number | null;
  onPick: (n: number) => void;
  disabled?: boolean;
}) {
  const nums = [1, 2, 3, 4, 5, 6];

  return (
    <div
      className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-2"
      role="group"
      aria-label="Pick your move"
    >
      {nums.map((n) => {
        const active = playerMove === n;
        return (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            whileHover={{ y: disabled ? 0 : -2 }}
            onClick={() => !disabled && onPick(n)}
            disabled={disabled}
            aria-pressed={active}
            aria-label={`Pick ${n}`}
            title={`Pick ${n}`}
            className={[
              "inline-flex items-center justify-center rounded-2xl px-0 py-3 text-lg font-bold tabular-nums select-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
              active
                ? "bg-emerald-400 text-gray-900 shadow-[0_8px_30px_rgba(16,185,129,.35)]"
                : "bg-white/10 hover:bg-white/15 border border-white/10 text-white",
              disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
            style={{ minWidth: 56 }}
          >
            {n}
          </motion.button>
        );
      })}
    </div>
  );
}