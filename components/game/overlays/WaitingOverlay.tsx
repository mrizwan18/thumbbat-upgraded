"use client";

import React from "react";
import { motion } from "framer-motion";

export default function WaitingOverlay({
  code,
  seconds,
  onCancel,
}: {
  code: string;
  seconds: number;
  onCancel: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="rounded-2xl border border-white/10 bg-gray-900 p-6 w-[90%] max-w-md text-center">
        <h3 className="text-xl font-semibold">Waiting for an opponent…</h3>
        <p className="mt-2 text-white/70">
          Room code: <span className="font-mono">{code}</span>
        </p>
        <p className="mt-1 text-white/70">Expires in {seconds}s</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            className="rounded-2xl border border-white/15 px-4 py-2 hover:bg-white/5"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}