"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function InningsOverlay({
  open,
  firstInningsScore,
  opponentName,
  inning,
}: {
  open: boolean;
  firstInningsScore: number | null;
  opponentName: string;
  inning: "batting" | "bowling" | null;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-gray-950/80 grid place-items-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
            <h3 className="text-2xl font-bold text-yellow-400">🏏 Innings Over!</h3>
            <p className="text-lg mt-2">First innings score: {firstInningsScore ?? 0}</p>
            <p className="text-lg">
              Now {opponentName}&apos;s time for {inning}. Target: {(firstInningsScore ?? 0) + 1}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}