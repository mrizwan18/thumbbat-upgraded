"use client";

import React, { useEffect, useState } from "react";
import { getSocket } from "@/src/lib/socket";
import type { GameClientState } from "../state/types";

export interface DebugStateOverlayProps {
  state: GameClientState;
  matchStatus: string;
  botStatus: string;
  roomStatus: string;
}

/**
 * Dev-only diagnostic readout (Phase 1 kickoff). Hard-gated on
 * `NODE_ENV !== "production"` so it cannot ship — this is not a
 * feature-flagged production affordance, it renders nothing at all in a
 * production build.
 *
 * Reads the Socket.IO singleton directly (`getSocket()` from
 * `src/lib/socket.ts`) rather than modifying `useGameSocket.ts` to expose
 * a `connected` flag — keeps this Phase 1 change from touching any file
 * on the "preserve" list, even additively.
 */
export default function DebugStateOverlay({ state, matchStatus, botStatus, roomStatus }: DebugStateOverlayProps) {
  const [socketStatus, setSocketStatus] = useState<"connected" | "disconnected">("disconnected");

  useEffect(() => {
    const s = getSocket();
    setSocketStatus(s.connected ? "connected" : "disconnected");
    const onConnect = () => setSocketStatus("connected");
    const onDisconnect = () => setSocketStatus("disconnected");
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="pointer-events-auto fixed bottom-2 left-2 z-[999] rounded-md border border-white/20 bg-black/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-white/90 shadow-lg">
      <div>
        STATE: <span className="text-emerald-400">{state}</span>
      </div>
      <div>
        SOCKET:{" "}
        <span className={socketStatus === "connected" ? "text-emerald-400" : "text-rose-400"}>{socketStatus}</span>
      </div>
      <div>MATCH: {matchStatus}</div>
      <div>BOT: {botStatus}</div>
      <div>ROOM: {roomStatus}</div>
    </div>
  );
}
