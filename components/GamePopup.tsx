import React from "react";
import { GameState, GameAction } from "@/utils/gameReducer";
import { Dispatch } from "react";
import router from "next/router";
import { restartGame } from "@/utils/gameLogic";

const GamePopup = ({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}) => {
  if (!state.showPopup) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
        <h3 className="text-3xl font-bold text-yellow-400">
          {state.winner} Wins! 🏆
        </h3>
        <p className="text-lg mt-2">
          Final Score: {state.score.user} - {state.score.opponent}
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="bg-gray-500 px-4 py-2 rounded"
            onClick={() => router.push("/")}
          >
            Exit
          </button>
          <button
            className="bg-blue-500 px-4 py-2 rounded"
            onClick={() => restartGame(dispatch)}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePopup;
