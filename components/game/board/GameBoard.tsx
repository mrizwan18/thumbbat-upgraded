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
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* who is batting/bowling */}
      <div className="text-center">
        <p className="text-lg">
          {myName}, you are{" "}
          <span className="text-yellow-400">{inning ?? "…"}</span>
        </p>
      </div>

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
        {playerMove != null && opponentMove != null && (
          <OpponentMoveDisplay
            opponent={opponentName}
            revealedMove={opponentMove}
          />
        )}
      </div>
    </div>
  );
}