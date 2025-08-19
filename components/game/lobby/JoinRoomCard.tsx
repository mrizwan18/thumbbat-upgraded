"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomCard() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const valid = normalized.length >= 4 && normalized.length <= 8;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h3 className="text-xl font-semibold">Private Room</h3>
      <p className="mt-1 text-sm text-white/70">Create a room to play with a friend, or join by code.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code (e.g. 7F2B)"
          className="w-full rounded-2xl border border-white/10 bg-gray-900/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400/60"
          aria-label="Room code"
        />
        <button
          disabled={!valid}
          onClick={() => router.push(`/room/join/${normalized}`)}
          className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-white/90 hover:bg-white/5 disabled:opacity-50"
        >
          Join
        </button>
      </div>

      <div className="mt-3">
        <button
          onClick={() => router.push("/room/host/new")}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95 w-full sm:w-auto"
        >
          Create private room
        </button>
      </div>

      <div className="mt-3 text-xs text-white/50">Rooms are limited to 2 players and expire automatically.</div>
    </div>
  );
}