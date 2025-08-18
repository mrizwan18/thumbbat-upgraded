"use client";

import React from "react";

type TossPhase = "idle" | "calling" | "waiting-call" | "showing-result" | "choosing" | "waiting-choice" | "done";

export default function TossOverlay({
  phase,
  tossCountdown,
  iChooseCountdown,
  tossCall,
  tossOutcome,
  youWon,
  opponentName,
  onCall,
  onChoose,
}: {
  phase: TossPhase;
  tossCountdown: number;
  iChooseCountdown: number;
  tossCall: "heads" | "tails" | null;
  tossOutcome: "heads" | "tails" | null;
  youWon?: boolean;
  opponentName: string;
  onCall: (call: "heads" | "tails") => void;
  onChoose: (choice: "bat" | "bowl") => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 grid place-items-center z-40">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-[92%] max-w-md text-center">
        {phase === "calling" && (
          <>
            <h3 className="text-2xl font-bold mb-4">🪙 Your call!</h3>
            <div className="flex gap-4 justify-center mb-4">
              <button className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded" onClick={() => onCall("heads")}>
                Heads
              </button>
              <button className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded" onClick={() => onCall("tails")}>
                Tails
              </button>
            </div>
            <p className="text-sm opacity-80">Auto-pick in {tossCountdown}s…</p>
          </>
        )}

        {phase === "waiting-call" && (
          <>
            <h3 className="text-2xl font-bold mb-2">🪙 Waiting for opponent to call…</h3>
            <p className="text-sm opacity-80">Auto-pick for them in {tossCountdown}s</p>
          </>
        )}

        {phase === "showing-result" && (
          <>
            <h3 className="text-2xl font-bold mb-3">🪙 Toss Result</h3>
            <p className="mb-1">Call: <span className="text-yellow-300">{tossCall}</span></p>
            <p className="mb-3">Outcome: <span className="text-green-300">{tossOutcome}</span></p>
            <p>{youWon ? "You won the toss!" : `${opponentName} won the toss.`}</p>
          </>
        )}

        {phase === "choosing" && (
          <>
            <h3 className="text-2xl font-bold mb-3">You won—choose your start</h3>
            <div className="flex gap-4 justify-center mb-4">
              <button className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded" onClick={() => onChoose("bat")}>
                Bat First
              </button>
              <button className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded" onClick={() => onChoose("bowl")}>
                Bowl First
              </button>
            </div>
            <p className="text-sm opacity-80">Auto-pick in {iChooseCountdown}s…</p>
          </>
        )}

        {phase === "waiting-choice" && (
          <>
            <h3 className="text-2xl font-bold mb-2">Opponent is choosing…</h3>
            <p className="text-sm opacity-80">Auto-pick in {iChooseCountdown}s</p>
          </>
        )}
      </div>
    </div>
  );
}