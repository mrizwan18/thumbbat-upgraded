"use client";

import React from "react";
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

export default function GameScreen() {
  // Redirect to login if unauthenticated
  useAuthGuard("/login?next=/game");

  /**
   * Multiplayer hook (socket-driven)
   */
  const {
    // identity & room
    myName,
    opponent,
    roomId,

    // lobby state
    mode, // "player" | null
    searching,
    searchTime,
    searchError,
    startQuickMatch,
    cancelQuickMatch,

    // private rooms
    createRoom,
    joinRoomByCode,
    waiting,          // { code, expiresAt } | null
    waitCountdown,    // seconds left
    cancelWaiting,

    // live game state (multiplayer)
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

    // toss state
    tossPhase,
    tossCountdown,
    tossCall,
    tossOutcome,
    tossWinnerId,
    iChooseCountdown,
    callHeadsOrTails,
    chooseBatOrBowl,

    // actions
    playMultiplayerMove,
  } = useGameSocket();

  /**
   * Bot hook (owns all scoring/innings/winner for solo mode)
   * We pass myName so the winner string can say “You” properly.
   */
  const {
    isBotMode,
    startBotGame,
    endBotMode,
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

  // Merge state depending on active mode
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
      {/* background decoration */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.22),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Play ThumbBat</h1>
          <p className="mt-2 text-white/70">
            Quick match, private room, or solo vs bot.
          </p>
        </div>

        {/* Lobby (visible only when not waiting / not started / not bot mode) */}
        {!waiting && !gameStarted && !isBotMode && (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                // enter bot mode and start the solo game
                startBotGame();
              }}
            />
          </div>
        )}

        {/* Waiting overlay for private room */}
        <AnimatePresence>
          {waiting && (
            <WaitingOverlay
              code={waiting.code}
              seconds={waitCountdown}
              onCancel={() => cancelWaiting(waiting.code)}
            />
          )}
        </AnimatePresence>

        {/* Toss overlays (multiplayer only, pre-game) */}
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
              // If your component supports it, you can pass undefined here;
              // deciding winner UI can be based on tossOutcome + names.
              youWon={undefined}
              opponentName={opponent || "Opponent"}
              onCall={(call) => roomId && callHeadsOrTails(roomId, call)}
              onChoose={(choice) => roomId && chooseBatOrBowl(roomId, choice)}
            />
          )}

        {/* Game board */}
        {gameStarted || isBotMode ? (
          <div className="mt-10">
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
            />
          </div>
        ) : null}
      </div>

      {/* Innings overlay (shown when bot mode toggles it; multiplayer can manage its own UI) */}
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
            className="fixed inset-0 bg-gray-950/80 grid place-items-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-2xl font-bold text-yellow-400">
                🏏 Cricket Gods chose you for{" "}
                <span className="text-green-400">{activeInning}</span>
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over modal (works for both modes) */}
      <GameOverModal
        open={!!activeGameOver}
        winner={activeWinner || ""}
        userScore={activeScore.user}
        opponentScore={activeScore.opponent}
        onExit={() => (window.location.href = "/")}
        onRestart={() => {
          // Restart in bot mode immediately
          if (!isBotMode) {
            // leave multiplayer flow if you want to offer a bot rematch from here
          }
          startBotGame();
        }}
      />
    </div>
  );
}