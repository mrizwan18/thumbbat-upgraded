"use client";

import React from "react";
import Scoreboard from "@/components/Scoreboard";

import GameMoveVisual from "@/components/game/board/GameMoveVisual";
import MoveSelection from "@/components/MoveSelection";
import OpponentMoveDisplay from "@/components/OpponentMoveDisplay";

type Inning = "batting" | "bowling" | null;

export default function GameBoard({
  myName,
  opponentName,
  inning,
  score,
  playerMove,
  opponentMove,
  roundCountdown,
  isMultiplayer,
  canPick,
  onPick,
  secondInningStarted = false,
}: {
  myName: string;
  opponentName: string;
  inning: Inning;
  score: {
    user: number;
    opponent: number;
    firstInningScore: number | null;
  };
  playerMove: number | null;
  opponentMove: number | null;
  roundCountdown: number;
  isMultiplayer: boolean;
  canPick: boolean;
  onPick: (move: number) => void;
  secondInningStarted?: boolean;
}) {
  const target =
    secondInningStarted && score.firstInningScore != null
      ? score.firstInningScore + 1
      : null;

  const need =
    target == null
      ? null
      : inning === "batting"
      ? Math.max(0, target - score.user)
      : Math.max(0, target - score.opponent);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* who is batting/bowling */}
      <div className="text-center">
        <p className="text-lg">
          {myName}, you are{" "}
          <span className="text-yellow-400">{inning ?? "…"}</span>
        </p>
      </div>

      {/* Target strip (second innings) */}
      {target != null && (    
        <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center">
          <span className="text-sm text-white/70">
            Target: <b className="text-white">{target}</b>{" "}
            {need != null && (
              <>
                •{" "}
                {inning === "batting" ? (
                  <>
                    You need <b className="text-emerald-300">{need}</b>
                  </>
                ) : (
                  <>
                    They need <b className="text-rose-300">{need}</b>
                  </>
                )}
              </>
            )}
          </span>
        </div>
      )}
      {/* scores */}
      <Scoreboard
        userScore={score.user}
        opponentScore={score.opponent}
        opponentName={opponentName}
      />

      {/* hands: idle fists → bounce → reveal both moves */}
      <div className="flex justify-center gap-6">
        <GameMoveVisual
          playerMove={playerMove ?? null}
          opponentMove={opponentMove ?? null}
        />
      </div>

      {/* controls + status */}
      <div className="flex flex-col items-center">
        <MoveSelection
          playerMove={playerMove ?? null}
          onPick={onPick}
          disabled={!canPick}
        />

        {isMultiplayer && roundCountdown > 0 && (
          <p className="mt-2 text-sm opacity-80">
            Pick your move in{" "}
            <span className="text-yellow-400">{roundCountdown}s</span>
          </p>
        )}

        {/* small reveal chip (only once both are known) */}
        <OpponentMoveDisplay
            opponent={opponentName}
            revealedMove={opponentMove}
          />
      </div>
    </div>
  );
}