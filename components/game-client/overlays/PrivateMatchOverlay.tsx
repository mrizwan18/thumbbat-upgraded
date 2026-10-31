"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { getButtonClassName } from "@/components/ui/buttonStyles";

export interface PrivateMatchOverlayProps {
  inRoom: boolean;
  roomCode: string | null;
  roomPlayers: string[];
  isHost: boolean;
  roomReady: boolean;
  onJoin: (code: string) => void | Promise<void>;
  onCreate: () => void | Promise<void>;
  onStartGame: () => void;
  /** Undefined once a room exists — there's no exposed way to leave a room today (see PHASE_2_HOME.md limitations), so no dismiss affordance is offered in that state rather than a broken one. */
  onClose?: () => void;
}

/**
 * The private-match lobby, presented as a game-world overlay (per the
 * Phase 2 brief) rather than the old centered SaaS card — no card
 * border/heading treatment, sits directly over the dimmed arena. Two
 * views in one component: code-entry (no room yet) and waiting-room
 * (room exists), switched by `inRoom`.
 */
export default function PrivateMatchOverlay({
  inRoom,
  roomCode,
  roomPlayers,
  isHost,
  roomReady,
  onJoin,
  onCreate,
  onStartGame,
  onClose,
}: PrivateMatchOverlayProps) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const handleJoin = async () => {
    const cleaned = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length < 4) return;
    setBusy(true);
    try {
      await onJoin(cleaned);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    setBusy(true);
    try {
      await onCreate();
    } finally {
      setBusy(false);
    }
  };

  if (inRoom) {
    return (
      <div className="w-full max-w-sm rounded-t-2xl border-t border-tb-mint/30 bg-tb-bg-elevated/95 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center backdrop-blur-md sm:rounded-2xl sm:border">
        <p className="text-tb-label uppercase text-tb-text-muted">Room Code</p>
        <p className="mt-1 text-tb-display tracking-widest text-tb-mint">{roomCode}</p>
        <p className="mt-3 text-tb-caption text-tb-text-secondary">
          {roomPlayers.length > 1 ? roomPlayers.join(" vs ") : `${roomPlayers[0] ?? "You"} — waiting for opponent…`}
        </p>
        {isHost && (
          <Button variant="primary" disabled={!roomReady} className="mt-5 w-full" onClick={onStartGame}>
            Start Game
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-t-2xl border-t border-tb-border bg-tb-bg-elevated/95 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center backdrop-blur-md sm:rounded-2xl sm:border">
      <p className="text-tb-h2 text-tb-text-primary">Private Match</p>
      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ROOM CODE"
          maxLength={8}
          className="w-full rounded-tb-lg border border-tb-border bg-tb-surface px-4 py-3 text-center text-base tracking-widest text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:ring-2 focus:ring-tb-primary/60"
        />
        <Button variant="primary" disabled={busy || code.length < 4} onClick={handleJoin}>
          Join
        </Button>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={handleCreate}
        className={`${getButtonClassName({ variant: "ghost" })} mt-3 w-full`}
      >
        Create New Room
      </button>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-tb-caption text-tb-text-muted hover:text-tb-text-secondary"
        >
          Back
        </button>
      )}
    </div>
  );
}
