"use client";

import React from "react";
import { WorldLayer, HUDLayer, InteractionLayer } from "../shell/layerSlots";
import type { GameClientState, TossPhase } from "../state/types";

export interface MinimalStatePlaceholderProps {
  state: Extract<GameClientState, "matchmaking" | "match_intro" | "gameplay" | "result">;
  username: string;
  isBotMode: boolean;
  searchTime: number;
  searchError: string | null;
  onCancelSearch: () => void;
  tossPhase: TossPhase;
  tossCall: "heads" | "tails" | null;
  onCallHeadsOrTails: (call: "heads" | "tails") => void;
  onChooseBatOrBowl: (choice: "bat" | "bowl") => void;
  botInning: "batting" | "bowling" | null;
  inning: "batting" | "bowling" | null;
  score: { user: number; opponent: number };
  onPick: (move: number) => void;
  winner: string | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

/**
 * Bare, undesigned stand-ins for the four states Phase 2 explicitly does
 * not build: matchmaking, match_intro, gameplay, result. Functional only
 * — real handlers, real state — no visual investment, per "Do NOT
 * proceed to Matchmaking, Toss, Gameplay or Result." Their own phases
 * replace this entirely; nothing here is meant to survive.
 */
export default function MinimalStatePlaceholder({
  state,
  username,
  isBotMode,
  searchTime,
  searchError,
  onCancelSearch,
  tossPhase,
  tossCall,
  onCallHeadsOrTails,
  onChooseBatOrBowl,
  botInning,
  inning,
  score,
  onPick,
  winner,
  onPlayAgain,
  onGoHome,
}: MinimalStatePlaceholderProps) {
  const activeInning = isBotMode ? botInning : inning;

  return (
    <>
      <WorldLayer>
        <div className="flex h-full w-full items-center justify-center bg-tb-bg-deep">
          <p className="text-2xl font-bold uppercase tracking-widest text-white/15">{state}</p>
        </div>
      </WorldLayer>

      <HUDLayer>
        <div className="p-4 text-sm font-semibold text-tb-text-primary" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          {username}
        </div>
      </HUDLayer>

      <InteractionLayer>
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-tb-text-primary">
          {state === "matchmaking" && (
            <>
              <p>Searching for opponent {Math.min(searchTime, 60)}s</p>
              {searchError && <p className="text-tb-danger">{searchError}</p>}
              <button className="rounded-tb-md border border-tb-border px-4 py-2" onClick={onCancelSearch}>
                Cancel
              </button>
            </>
          )}

          {state === "match_intro" && !isBotMode && (
            <>
              <p>Toss: {tossPhase}</p>
              {tossPhase === "calling" && (
                <div className="flex gap-2">
                  <button className="rounded-tb-md border border-tb-border px-4 py-2" onClick={() => onCallHeadsOrTails("heads")}>
                    Heads
                  </button>
                  <button className="rounded-tb-md border border-tb-border px-4 py-2" onClick={() => onCallHeadsOrTails("tails")}>
                    Tails
                  </button>
                </div>
              )}
              {tossPhase === "choosing" && (
                <div className="flex gap-2">
                  <button className="rounded-tb-md border border-tb-border px-4 py-2" onClick={() => onChooseBatOrBowl("bat")}>
                    Bat
                  </button>
                  <button className="rounded-tb-md border border-tb-border px-4 py-2" onClick={() => onChooseBatOrBowl("bowl")}>
                    Bowl
                  </button>
                </div>
              )}
              {tossPhase === "showing-result" && <p>{tossCall}</p>}
            </>
          )}

          {state === "match_intro" && isBotMode && (
            <p className="text-xl font-bold text-tb-warning">You are {activeInning}</p>
          )}

          {state === "gameplay" && (
            <>
              <p className="text-sm text-tb-text-secondary">{activeInning}</p>
              <p className="tabular-nums">
                {score.user} — {score.opponent}
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    className="h-10 w-10 rounded-full border border-tb-mint/40 font-bold"
                    onClick={() => onPick(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}

          {state === "result" && (
            <>
              <p className="text-2xl font-bold">{winner}</p>
              <p className="tabular-nums">
                {score.user} — {score.opponent}
              </p>
              <div className="flex gap-3">
                <button className="rounded-tb-md bg-tb-primary px-4 py-2 font-bold text-tb-bg-elevated" onClick={onPlayAgain}>
                  Play Again
                </button>
                <button className="rounded-tb-md border border-tb-border px-4 py-2" onClick={onGoHome}>
                  Home
                </button>
              </div>
            </>
          )}
        </div>
      </InteractionLayer>
    </>
  );
}
