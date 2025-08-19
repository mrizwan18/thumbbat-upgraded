"use client";

import React, { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useGameSocket } from "@/src/hooks/useGameSocket";
import { useBotGame } from "@/src/hooks/useBotGame";

import QuickMatchCard from "@/components/game/lobby/QuickMatchCard";
import JoinRoomCard from "@/components/game/lobby/JoinRoomCard";
import SoloPracticeCard from "@/components/game/lobby/SoloPracticeCard";

import WaitingOverlay from "@/components/game/overlays/WaitingOverlay";
import TossOverlay from "@/components/game/overlays/TossOverlay";
import InningsOverlay from "@/components/game/overlays/InningsOverlay";
import GameOverModal from "@/components/game/overlays/GameOverModal";

import GameBoard from "@/components/game/board/GameBoard";

export const revalidate = 0;

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="min-h-[100svh] bg-gray-950 text-white grid place-items-center">
        <div className="animate-pulse text-white/60">Loading game…</div>
      </div>
    );
  }
  return <>{children}</>;
}

function GameScreenInner() {
  useAuthGuard("/login?next=/game");

  const {
    myName,
    opponent,
    roomId,

    // Lobby
    mode,
    searching,
    searchTime,
    searchError,
    startQuickMatch,
    cancelQuickMatch,

    // Private rooms
    createRoom,
    joinRoomByCode,
    waiting,
    waitCountdown,
    cancelWaiting,

    // Game (MP)
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

    // Toss
    tossPhase,
    tossCountdown,
    tossCall,
    tossOutcome,
    tossWinnerId,
    iChooseCountdown,
    callHeadsOrTails,
    chooseBatOrBowl,

    // Actions
    playMultiplayerMove,
  } = useGameSocket();

  /* ------------- Bot (solo) state ------------- */
  const {
    isBotMode,
    startBotGame,
    opponentName: botOpponentName,
    inning: botInning,
    score: botScore,
    secondInningStarted: botSecondInnings,
    playerMove: botPlayerMove,
    opponentMove: botOpponentMove,
    showGameStartPopup,
    showInningsOverlay,
    isGameOver: botGameOver,
    winner: botWinner,
    canPick: botCanPick,
    playBotMove,
  } = useBotGame(myName);

  /* ---------- Merge active state by mode ---------- */
  const activeInning = isBotMode ? botInning : inning;
  const activeScore = isBotMode ? botScore : score;
  const activePlayerMove = isBotMode ? botPlayerMove : playerMove;
  const activeOpponentMove = isBotMode ? botOpponentMove : opponentMove;
  const activeGameOver = isBotMode ? botGameOver : isGameOver;
  const activeWinner = isBotMode ? botWinner : winner;
  const activeRoundCountdown = isBotMode ? 0 : roundDeadline ? roundCountdown : 0;
  const activeOpponentName = isBotMode ? botOpponentName : (opponent || "Opponent");
  const canPick = isBotMode ? botCanPick : !activeGameOver && !hasPickedThisRound;

  return (
    <div className="min-h-[100svh] bg-gray-950 text-white relative">
      {/* Background (lighter/Smaller on mobile) */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.18),_transparent)] sm:h-[36rem] sm:w-[36rem] md:h-[42rem] md:w-[42rem]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:36px_36px] sm:bg-[size:42px_42px]" />

      {/* Page padding (mobile-first) */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 pb-20" style={{ paddingBottom: "max(5rem, calc(5rem + env(safe-area-inset-bottom)))" }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold tracking-tight">
            Play ThumbBat
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/70">
            Quick match, private room, or solo vs bot.
          </p>
        </div>

        {/* Lobby (stack on mobile) */}
        {!waiting && !gameStarted && !isBotMode && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickMatchCard
              searching={searching}
              searchTime={searchTime}
              searchError={searchError}
              onStart={startQuickMatch}
              onCancel={cancelQuickMatch}
            />
            <JoinRoomCard
              myName={myName}
              onJoin={(code) => joinRoomByCode(code)}
              onCreate={() => createRoom()}
            />
            <SoloPracticeCard
              onStart={() => {
                startBotGame();
              }}
            />
          </div>
        )}

        {/* Waiting overlay (private room) */}
        <AnimatePresence>
          {waiting && (
            <WaitingOverlay
              code={waiting.code}
              seconds={waitCountdown}
              onCancel={() => cancelWaiting(waiting.code)}
            />
          )}
        </AnimatePresence>

        {/* Toss overlays (MP only, pre-game) */}
        {!isBotMode &&
          !gameStarted &&
          tossPhase !== "idle" &&
          tossPhase !== "done" && (
            <TossOverlay
              phase={tossPhase}
              tossCountdown={tossCountdown}
              iChooseCountdown={iChooseCountdown}
              tossCall={tossCall}
              tossOutcome={tossOutcome}
              youWon={undefined}
              opponentName={opponent || "Opponent"}
              onCall={(call) => roomId && callHeadsOrTails(roomId, call)}
              onChoose={(choice) => roomId && chooseBatOrBowl(roomId, choice)}
            />
          )}

        {/* Game board (constrain width on mobile for comfortable reach) */}
        {gameStarted || isBotMode ? (
          <div className="mt-6 sm:mt-10">
            <div className="mx-auto w-full max-w-[720px]">
              <GameBoard
                myName={myName}
                opponentName={activeOpponentName}
                inning={activeInning}
                score={activeScore}
                playerMove={activePlayerMove}
                opponentMove={activeOpponentMove}
                roundCountdown={activeRoundCountdown}
                isMultiplayer={!isBotMode}
                canPick={canPick}
                onPick={(move) => {
                  if (isBotMode) {
                    playBotMove(move);
                  } else if (roomId) {
                    playMultiplayerMove(roomId, move);
                  }
                }}
                secondInningStarted={secondInningStarted || isBotMode ? botSecondInnings : secondInningStarted}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Innings overlay */}
      <InningsOverlay
        open={!!showInningsOverlay}
        firstInningsScore={activeScore.firstInningScore}
        opponentName={activeOpponentName}
        inning={activeInning}
      />

      {/* Game start popup (bot only) */}
      <AnimatePresence>
        {isBotMode && showGameStartPopup && (
          <motion.div
            className="fixed inset-0 bg-gray-950/80 grid place-items-center z-40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-sm bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-400">
                🏏 Cricket Gods chose you for{" "}
                <span className="text-green-400">{activeInning}</span>
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over modal */}
      <GameOverModal
        open={!!activeGameOver}
        winner={activeWinner || ""}
        userScore={activeScore.user}
        opponentScore={activeScore.opponent}
        onExit={() => (window.location.href = "/")}
        onRestart={() => {
          // Quick rematch in bot mode for mobile users
          startBotGame();
        }}
      />
    </div>
  );
}

/* ---------------- Exported Screen ---------------- */
export default function GameScreen() {
  return (
    <ClientOnly>
      {/* Wrap anything that uses useSearchParams() */}
      <Suspense
        fallback={
          <div className="min-h-[100svh] bg-gray-950 text-white grid place-items-center">
            <div className="animate-pulse text-white/60">Loading…</div>
          </div>
        }
      >
        <GameScreenInner />
      </Suspense>
    </ClientOnly>
  );
}