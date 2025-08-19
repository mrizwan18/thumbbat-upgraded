"use client";

import React, { useState } from "react";

type Props = {
  /** Optional: show the current user's name on the card */
  myName?: string;
  /** Join a room by code (A–Z, 0–9, 4–8 chars) */
  onJoin: (code: string) => void | Promise<void>;
  /** Create a new room (will generate code server-side or in hook) */
  onCreate: () => void | Promise<void>;
};

export default function JoinRoomCard({ myName, onJoin, onCreate }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sanitize = (raw: string) =>
    raw.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const handleJoin = async () => {
    const cleaned = sanitize(code);
    if (cleaned.length < 4 || cleaned.length > 8) {
      setError("Enter a 4–8 character code.");
      return;
    }
    setError(null);
    try {
      setBusy(true);
      await onJoin(cleaned);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    try {
      setBusy(true);
      await onCreate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-semibold">Private Room</h3>
        {myName ? (
          <span className="text-xs text-white/50">You: {myName}</span>
        ) : null}
      </div>

      <p className="mt-1 text-sm text-white/70">
        Create a room and share the code, or join someone else’s.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          inputMode="latin"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={8}
          value={code}
          onChange={(e) => {
            setCode(sanitize(e.target.value));
            if (error) setError(null);
          }}
          placeholder="Enter code (e.g., 7F2K)"
          className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        />
        <button
          onClick={handleJoin}
          disabled={busy || code.length < 4}
          className={[
            "rounded-2xl px-5 py-3 font-semibold transition-[filter,transform]",
            busy || code.length < 4
              ? "bg-white/10 text-white/60 cursor-not-allowed"
              : "bg-emerald-400 text-gray-900 shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 active:scale-95",
          ].join(" ")}
        >
          Join
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleCreate}
          disabled={busy}
          className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/90 hover:bg-white/5 disabled:opacity-60"
        >
          Create new room
        </button>
        {error && <span className="text-sm text-rose-300">{error}</span>}
      </div>

      <div className="mt-4 text-xs text-white/50">
        Codes use A–Z and 0–9, 4–8 characters.
      </div>
    </div>
  );
}