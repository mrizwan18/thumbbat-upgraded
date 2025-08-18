"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function GameOverModal({
  open,
  winner,
  userScore,
  opponentScore,
  onExit,
  onRestart,
}: {
  open: boolean;
  winner: string;
  userScore: number;
  opponentScore: number;
  onExit: () => void;
  onRestart: () => void;
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
            <h3 className="text-3xl font-bold text-yellow-400">{winner}🏆</h3>
            <p className="text-lg mt-2">
              Final Score: {userScore} - {opponentScore}
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white font-semibold" onClick={onExit}>
                Exit
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold" onClick={onRestart}>
                Restart (vs Bot)
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}