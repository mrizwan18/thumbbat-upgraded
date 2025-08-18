"use client";

import React from "react";

export default function SoloPracticeCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h3 className="text-xl font-semibold">Solo Practice</h3>
      <p className="mt-1 text-sm text-white/70">Warm up against Rizzwon 🤖</p>
      <div className="mt-4">
        <button
          onClick={onStart}
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(129,140,248,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
        >
          Play vs Bot
        </button>
      </div>
    </div>
  );
}