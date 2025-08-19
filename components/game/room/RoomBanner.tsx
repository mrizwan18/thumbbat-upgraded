"use client";

import React from "react";
import { Clipboard, Play } from "lucide-react";

type PlayerInfo = { id: string; name: string };

export default function RoomBanner({
  code,
  players,
  isHost,
  canStart,
  expireSeconds,
  onCopy,
  onStart,
}: {
  code: string | null;
  players: PlayerInfo[];
  isHost: boolean;
  canStart: boolean;
  expireSeconds: number | null;
  onCopy: () => void;
  onStart: () => void;
}) {
  const p0 = players[0]?.name || "Player 1";
  const p1 = players[1]?.name || null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-white/60">Room code</div>
          <div className="mt-1 inline-flex items-center gap-2">
            <span className="font-mono text-lg">{code ?? "—"}</span>
            {code ? (
              <button
                onClick={onCopy}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                aria-label="Copy room code"
              >
                <Clipboard size={14} />
                Copy
              </button>
            ) : null}
          </div>
          {expireSeconds != null && expireSeconds > 0 && (
            <div className="mt-1 text-xs text-white/60">
              Expires in <span className="text-yellow-300">{expireSeconds}s</span>
            </div>
          )}
        </div>

        <div className="text-sm">
          <div className="text-white/70">Players</div>
          <div className="mt-1 flex items-center gap-2">
            <Badge text={p0} solid />
            <span className="text-white/40">vs</span>
            <Badge text={p1 ?? "Waiting…"} solid={!!p1} />
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button
              onClick={onStart}
              disabled={!canStart}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                canStart
                  ? "bg-emerald-400 text-gray-900 shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95"
                  : "bg-white/10 text-white/60 cursor-not-allowed",
              ].join(" ")}
            >
              <Play size={16} />
              Start game
            </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ text, solid }: { text: string; solid?: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs",
        solid
          ? "bg-emerald-400/90 text-gray-900"
          : "border border-white/15 bg-white/5 text-white/70",
      ].join(" ")}
    >
      {text}
    </span>
  );
}