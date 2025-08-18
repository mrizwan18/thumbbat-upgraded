"use client";

import React, { useState } from "react";

export default function JoinRoomCard({
  myName,
  onJoin,
  onCreate,
}: {
  myName: string;
  onJoin: (code: string) => void;
  onCreate: () => void;
}) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalized.length < 4 || normalized.length > 8) {
      setErr("Enter a 4–8 character code");
      return;
    }
    onJoin(normalized);
  };

  const create = async () => {
    setToast("Creating room…");
    onCreate();
    setTimeout(() => setToast(null), 1200);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-lime-400/10 to-amber-300/10 p-6 md:p-8 backdrop-blur-xl">
      <h3 className="text-xl md:text-2xl font-bold tracking-tight">Play with a friend</h3>
      <p className="mt-1 text-sm text-white/70">Create a private room and share the code, or join one.</p>

      <form onSubmit={join} className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code (e.g. 7F2B)"
          className="w-full rounded-2xl border border-white/10 bg-gray-900/60 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/60"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
        >
          Join room
        </button>
      </form>

      <div className="mt-3">
        <button
          onClick={create}
          className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-white/90 hover:bg-white/5 transition-colors"
        >
          Create private room
        </button>
      </div>

      {err && <p className="mt-2 text-sm text-amber-300">{err}</p>}
      {toast && (
        <div className="mt-3 inline-block rounded-xl bg-gray-900/90 px-3 py-2 text-xs text-white/90 border border-white/10">
          {toast}
        </div>
      )}
    </div>
  );
}