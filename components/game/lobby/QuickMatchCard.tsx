"use client";

import React from "react";

export default function QuickMatchCard({
  searching,
  searchTime,
  searchError,
  onStart,
  onCancel,
}: {
  searching: boolean;
  searchTime: number;
  searchError: string | null;
  onStart: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h3 className="text-xl font-semibold">Quick Match</h3>
      <p className="mt-1 text-sm text-white/70">We’ll find someone for you right now.</p>
      <div className="mt-4 flex items-center gap-3">
        {!searching ? (
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
            onClick={onStart}
          >
            Find opponent
          </button>
        ) : (
          <>
            <span className="text-sm text-white/80">
              Searching… <span className="text-yellow-300">{searchTime}s</span>
            </span>
            <button
              onClick={onCancel}
              className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/90 hover:bg-white/5"
            >
              Cancel
            </button>
          </>
        )}
      </div>
      {searchError && <p className="mt-2 text-sm text-rose-300">{searchError}</p>}
      <div className="mt-4 text-xs text-white/50">1 minute timeout if no match.</div>
    </div>
  );
}