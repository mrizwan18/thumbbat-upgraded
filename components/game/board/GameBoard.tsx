"use client";

import React from "react";
import Scoreboard from "@/components/Scoreboard";
import MoveSelection from "@/components/MoveSelection";
import OpponentMoveDisplay from "@/components/OpponentMoveDisplay";
import GameMoveImages from "@/components/GameMoveImages";

const opStartImg = "/images/start-r.png";
const plStartImg = "/images/start.png";

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
  inning: "batting" | "bowling" | null;
  score: { user: number; opponent: number; firstInnings?: number; firstInningScore: number | null };
  playerMove: number | null;
  opponentMove: number | null;
  roundCountdown: number;
  isMultiplayer: boolean;
  canPick: boolean;
  onPick: (move: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="text-center">
        <p className="text-lg">
          {myName}, you are <span className="text-yellow-400">{inning}</span>
        </p>
      </div>

      <Scoreboard userScore={score.user} opponentScore={score.opponent} opponentName={opponentName} />

      <div className="flex justify-center gap-6 mb-2">
        <GameMoveImages playerMove={playerMove ?? 0} opponentMove={opponentMove ?? 0} isPlayer={true} startImage={plStartImg} />
        <GameMoveImages playerMove={playerMove ?? 0} opponentMove={opponentMove ?? 0} isPlayer={false} startImage={opStartImg} />
      </div>

      <div className="flex flex-col items-center">
        <MoveSelection playerMove={playerMove ?? 0} playMove={onPick} isDisabled={!canPick} />

        {isMultiplayer && roundCountdown > 0 && (
          <p className="mt-2 text-sm opacity-80">
            Pick your move in <span className="text-yellow-400">{roundCountdown}s</span>
          </p>
        )}

        {playerMove && opponentMove && (
          <OpponentMoveDisplay opponent={opponentName} opponentMove={opponentMove ?? 0} isAnimating={false} />
        )}
      </div>
    </div>
  );
}