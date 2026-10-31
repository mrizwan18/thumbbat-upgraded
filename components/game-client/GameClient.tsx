"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useGameSocket } from "@/src/hooks/useGameSocket";
import { useBotGame } from "@/src/hooks/useBotGame";
import GameClientShell from "./shell/GameClientShell";
import { TransitionLayer } from "./shell/layerSlots";
import { useGameClientState } from "./state/useGameClientState";
import HomeState from "./states/HomeState";
import MinimalStatePlaceholder from "./states/MinimalStatePlaceholder";
import DebugStateOverlay from "./debug/DebugStateOverlay";

/**
 * The real production `/game` entry point (Phase 2). Owns every existing
 * hook exactly as `GameScreen.tsx`'s old `GameScreenInner` did — this is
 * a rendering-architecture change, not a game-logic change. `home` and
 * `private_lobby` render through the real `HomeState`; every other
 * derived state renders through the intentionally bare
 * `MinimalStatePlaceholder` until its own phase.
 */
export default function GameClient() {
  useAuthGuard("/login?next=/game");
  const router = useRouter();

  const {
    myName,
    roomId,
    searching,
    searchTime,
    searchError,
    startQuickMatch,
    cancelQuickMatch,
    createRoom,
    joinRoomByCode,
    roomCode,
    roomPlayers,
    roomReady,
    isHost,
    startRoomGame,
    gameStarted,
    inning,
    score,
    isGameOver,
    winner,
    playMultiplayerMove,
    tossPhase,
    tossCall,
    callHeadsOrTails,
    chooseBatOrBowl,
  } = useGameSocket();

  const {
    isBotMode,
    startBotGame,
    endBotMode,
    inning: botInning,
    score: botScore,
    showGameStartPopup,
    isGameOver: botGameOver,
    winner: botWinner,
    playBotMove,
  } = useBotGame(myName);

  const { state, overlay, openOverlay, closeOverlay } = useGameClientState({
    bootComplete: true,
    isAuthenticated: true,
    preGameInRoom: !gameStarted && !isBotMode && !!roomCode,
    gameStarted,
    searching,
    tossPhase,
    isGameOver,
    isBotMode,
    showGameStartPopup,
    botGameOver,
  });

  // Transition flash — a brief fade in TransitionLayer whenever the
  // derived state actually changes, so moving between states reads as a
  // transition rather than a webpage swap.
  const prevStateRef = useRef(state);
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (prevStateRef.current !== state) {
      prevStateRef.current = state;
      setFlashKey((k) => k + 1);
    }
  }, [state]);

  const activeScore = isBotMode
    ? { user: botScore.user, opponent: botScore.opponent }
    : { user: score.user, opponent: score.opponent };
  const activeWinner = isBotMode ? botWinner : winner;

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  const handlePlayAgain = () => {
    if (isBotMode) startBotGame();
    else router.push("/game"); // no client-side multiplayer reset exists yet — see PHASE_2_HOME.md limitations
  };

  const handleGoHome = () => {
    if (isBotMode) endBotMode();
    else router.push("/game");
  };

  return (
    <GameClientShell>
      {(state === "home" || state === "private_lobby" || overlay) && (
        <HomeState
          username={myName}
          onPlay={startQuickMatch}
          onSoloPractice={() => startBotGame()}
          onJoinRoom={async (code) => {
            await joinRoomByCode(code);
          }}
          onCreateRoom={async () => {
            await createRoom();
          }}
          onSignOut={handleSignOut}
          inPrivateLobby={state === "private_lobby"}
          roomCode={roomCode}
          roomPlayers={roomPlayers.map((p) => p.name)}
          isHost={isHost}
          roomReady={roomReady}
          onStartRoomGame={startRoomGame}
          activeOverlay={overlay}
          onOpenOverlay={openOverlay}
          onCloseOverlay={closeOverlay}
        />
      )}

      {(state === "matchmaking" || state === "match_intro" || state === "gameplay" || state === "result") && (
        <MinimalStatePlaceholder
          state={state}
          username={myName}
          isBotMode={isBotMode}
          searchTime={searchTime}
          searchError={searchError}
          onCancelSearch={cancelQuickMatch}
          tossPhase={tossPhase}
          tossCall={tossCall}
          onCallHeadsOrTails={(call) => roomId && callHeadsOrTails(roomId, call)}
          onChooseBatOrBowl={(choice) => roomId && chooseBatOrBowl(roomId, choice)}
          botInning={botInning}
          inning={inning}
          score={activeScore}
          onPick={(move) => (isBotMode ? playBotMove(move) : roomId && playMultiplayerMove(roomId, move))}
          winner={activeWinner}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      )}

      <TransitionLayer>
        <AnimatePresence>
          {flashKey > 0 && (
            <motion.div
              key={flashKey}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 bg-black"
            />
          )}
        </AnimatePresence>
      </TransitionLayer>

      <DebugStateOverlay
        state={state}
        matchStatus={`searching=${searching} roomCode=${roomCode ?? "—"}`}
        botStatus={`isBotMode=${isBotMode} gameOver=${botGameOver}`}
        roomStatus={`isHost=${isHost} roomReady=${roomReady}`}
      />
    </GameClientShell>
  );
}
