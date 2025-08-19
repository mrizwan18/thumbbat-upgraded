"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameSocket } from "@/src/hooks/useGameSocket";
import WaitingOverlay from "@/components/game/overlays/WaitingOverlay";
import TossOverlay from "@/components/game/overlays/TossOverlay";
import InningsOverlay from "@/components/game/overlays/InningsOverlay";
import GameOverModal from "@/components/game/overlays/GameOverModal";
import GameBoard from "@/components/game/board/GameBoard";

export const revalidate = 0;

function Inner() {
  const router = useRouter();
  const { intent, code } = useParams<{ intent: "host" | "join"; code: string }>();

  const {
    myName,
    opponent,
    roomId,
    waiting,
    waitCountdown,
    cancelWaiting,
    roomCode,
    roster,
    isHost,

    // start / join
    hostRoom,
    joinRoom,

    // toss & game
    startMatch,
    gameStarted,
    inning,
    score,
    playerMove,
    opponentMove,
    roundDeadline,
    roundCountdown,
    hasPickedThisRound,
    isGameOver,
    winner,
    secondInningStarted,

    tossPhase,
    tossCountdown,
    tossCall,
    tossOutcome,
    tossWinnerId,
    iChooseCountdown,
    callHeadsOrTails,
    chooseBatOrBowl,

    playMultiplayerMove,
  } = useGameSocket();

  // Kick off room intent once when we land here
  useEffect(() => {
    if (!code) return;
    if (intent === "host") {
      hostRoom(code);
    } else {
      joinRoom(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, code]);

  const copyRoomCode = async () => {
    const c = waiting?.code || roomCode;
    if (!c) return;
    try {
      await navigator.clipboard.writeText(c);
      alert("Room code copied!");
    } catch {
      alert("Copied: " + c);
    }
  };

  const activeOpponentName = opponent || "Opponent";
  const activeRoundCountdown = roundDeadline ? roundCountdown : 0;
  const canPick = !isGameOver && !hasPickedThisRound;

  return (
    <div className="min-h-[100svh] bg-gray-950 text-white relative">
      {/* background */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.22),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16">
        {/* Header with code + expiry + actions */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {intent === "host" ? "Hosting Private Room" : "Private Room"}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {(waiting?.code || roomCode) && (
              <button
                onClick={copyRoomCode}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                title="Copy room code"
              >
                <span className="font-mono text-white/90">{(waiting?.code || roomCode) as string}</span>
                <span className="text-emerald-300">Copy</span>
              </button>
            )}

            {waiting && !gameStarted && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                Expires in <span className="font-mono text-yellow-300">{waitCountdown}s</span>
              </span>
            )}

            <button
              onClick={() => {
                if (waiting?.code) cancelWaiting(waiting.code);
                router.replace("/game");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Leave room
            </button>
          </div>

          {/* Roster (max 2 players) */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm">
            {roster.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5"
              >
                <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-gray-900 text-xs font-extrabold">
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-white/90">{p.name}</span>
                {p.id === myIdRefHack() && (
                  <span className="text-[10px] text-white/50">(you)</span>
                )}
              </span>
            ))}
          </div>
          <div className="text-xs text-white/60">
            {roster.length < 2 ? "Waiting for a second player…" : "Room is full (2/2)"}
          </div>

          {/* Start button (host only, exactly 2 players, not started) */}
          {isHost && roster.length === 2 && !gameStarted && tossPhase === "idle" && (
            <button
              onClick={() => roomId && startMatch(roomId)}
              className="mt-3 inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
            >
              Start Game
            </button>
          )}

          {!gameStarted && (
            <p className="text-white/60 text-xs sm:text-sm">
              Max 2 players. The host can start once both are here.
            </p>
          )}
        </div>

        {/* Waiting overlay (only while fewer than 2 players + pre-game) */}
        <AnimatePresence>
          {waiting && !gameStarted && roster.length < 2 && (
            <WaitingOverlay
              code={waiting.code}
              seconds={waitCountdown}
              onCancel={() => cancelWaiting(waiting.code)}
            />
          )}
        </AnimatePresence>

        {/* Toss overlays (pre-game) */}
        {!gameStarted &&
          tossPhase !== "idle" &&
          tossPhase !== "done" && (
            <TossOverlay
              phase={tossPhase}
              tossCountdown={tossCountdown}
              iChooseCountdown={iChooseCountdown}
              tossCall={tossCall}
              tossOutcome={tossOutcome}
              youWon={undefined}
              opponentName={activeOpponentName}
              onCall={(call) => roomId && callHeadsOrTails(roomId, call)}
              onChoose={(choice) => roomId && chooseBatOrBowl(roomId, choice)}
            />
          )}

        {/* Game board (same as /game) */}
        {gameStarted && (
          <div className="mt-8">
            <GameBoard
              myName={myName}
              opponentName={activeOpponentName}
              inning={inning}
              score={score}
              playerMove={playerMove}
              opponentMove={opponentMove}
              roundCountdown={activeRoundCountdown}
              isMultiplayer={true}
              canPick={canPick}
              onPick={(move) => roomId && playMultiplayerMove(roomId, move)}
              secondInningStarted={secondInningStarted}
            />
          </div>
        )}
      </div>

      {/* Innings overlay */}
      <InningsOverlay
        open={false /* server drives innings modals in MP; keep as-needed */}
        firstInningsScore={score.firstInningScore}
        opponentName={activeOpponentName}
        inning={inning}
      />

      {/* Game over modal */}
      <GameOverModal
        open={!!isGameOver}
        winner={winner || ""}
        userScore={score.user}
        opponentScore={score.opponent}
        onExit={() => (window.location.href = "/")}
        onRestart={() => {
          // Host can rehost; for now return to /game
          router.replace("/game");
        }}
      />
    </div>
  );
}

// tiny helper to tag "(you)" in roster; pull from window if available
function myIdRefHack(): string {
  // socket.io client id is not directly exposed here; keeping it harmless
  // this simply avoids crashing when trying to tag "(you)"
  return "";
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100svh] bg-gray-950 text-white grid place-items-center">
          <div className="animate-pulse text-white/60">Loading room…</div>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}