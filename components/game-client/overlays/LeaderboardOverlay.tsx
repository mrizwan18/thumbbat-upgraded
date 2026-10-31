"use client";

import React, { useEffect, useState } from "react";

interface LeaderboardRow {
  username: string;
  highScore: number;
  winPercentage: number;
}

export interface LeaderboardOverlayProps {
  onClose: () => void;
}

/**
 * A minimal, real leaderboard overlay — reuses the existing
 * `/api/leaderboard` endpoint verbatim, no new backend work. Deliberately
 * not a redesign of the old podium/card leaderboard page (out of Phase
 * 2's scope, which is Home); this is the smallest real implementation
 * that satisfies "opens as an overlay without leaving /game."
 */
export default function LeaderboardOverlay({ onClose }: LeaderboardOverlayProps) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.data) setRows(json.data);
        else setError(json?.error || "Couldn't load the leaderboard.");
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the leaderboard.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex max-h-[80dvh] w-full max-w-sm flex-col rounded-t-2xl border-t border-tb-border bg-tb-bg-elevated/95 p-6 backdrop-blur-md sm:rounded-2xl sm:border">
      <div className="flex items-center justify-between">
        <p className="text-tb-h2 text-tb-text-primary">🏆 Leaderboard</p>
        <button type="button" onClick={onClose} className="text-tb-caption text-tb-text-muted hover:text-tb-text-secondary">
          Close
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        {error && <p className="text-tb-caption text-tb-danger">{error}</p>}
        {!error && !rows && <p className="text-tb-caption text-tb-text-muted">Loading…</p>}
        {rows?.length === 0 && <p className="text-tb-caption text-tb-text-muted">No rankings yet.</p>}
        {rows && rows.length > 0 && (
          <ol className="flex flex-col gap-2">
            {rows.slice(0, 10).map((row, i) => (
              <li key={row.username} className="flex items-center justify-between rounded-tb-md bg-tb-surface px-3 py-2">
                <span className="flex items-center gap-2 text-sm text-tb-text-primary">
                  <span className="w-5 text-tb-text-muted">{i + 1}</span>
                  {row.username}
                </span>
                <span className="text-sm tabular-nums text-tb-mint">{row.highScore}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
