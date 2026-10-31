"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useGameSocket } from "@/src/hooks/useGameSocket";
import { useBotGame } from "@/src/hooks/useBotGame";
import GameClientShell from "@/components/game-client/shell/GameClientShell";
import {
  WorldLayer,
  AtmosphereLayer,
  HUDLayer,
  InteractionLayer,
  FeedbackLayer,
  OverlayLayer,
  TransitionLayer,
} from "@/components/game-client/shell/layerSlots";
import { useGameClientState } from "@/components/game-client/state/useGameClientState";
import DebugStateOverlay from "@/components/game-client/debug/DebugStateOverlay";

/**
 * Phase 1 verification harness — proves the shell/state-machine
 * architecture against the REAL `useGameSocket()`/`useBotGame()` hooks
 * and the real socket server, end to end.
 *
 * This is not a designed screen. Every control here is plain HTML wired
 * directly to an existing, unmodified handler — the point is to prove
 * HOME -> MATCHMAKING -> PRIVATE_LOBBY -> MATCH_INTRO -> GAMEPLAY ->
 * RESULT is reachable through this shell without rewriting it, not to
 * look finished. Real screens are later phases.
 *
 * Same treatment as Sprint 6's `/dev/visual-foundation`: dev-only,
 * unauthenticated at the middleware level (matcher is `/game/:path*`),
 * unlinked from any nav. Needs the same removal/gating decision before
 * production.
 */
function GameClientShellHarnessInner() {
  useAuthGuard("/login?next=/dev/game-client-shell");
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  const {
    myName,
    opponent,
    roomId,
    mode,
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
    opponentName: botOpponentName,
    inning: botInning,
    score: botScore,
    showGameStartPopup,
    isGameOver: botGameOver,
    winner: botWinner,
    canPick: botCanPick,
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

  const activeInning = isBotMode ? botInning : inning;
  const activeScore = isBotMode ? botScore : score;
  const activeGameOver = isBotMode ? botGameOver : isGameOver;
  const activeWinner = isBotMode ? botWinner : winner;

  return (
    <GameClientShell>
      <WorldLayer>
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-indigo-950 to-black">
          <p className="text-3xl font-bold uppercase tracking-widest text-white/30">{state}</p>
        </div>
      </WorldLayer>

      <AtmosphereLayer>
        <div className="absolute right-3 top-3 text-[10px] uppercase tracking-widest text-white/20">atmosphere</div>
      </AtmosphereLayer>

      <HUDLayer>
        <div className="flex items-center justify-between p-4 text-white">
          <span className="text-sm font-semibold">{myName}</span>
          {(gameStarted || isBotMode) && !activeGameOver && (
            <span className="tabular-nums text-sm">
              {activeScore.user} — {activeScore.opponent}
            </span>
          )}
        </div>
      </HUDLayer>

      <InteractionLayer>
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-white">
          {state === "home" && (
            <div className="flex flex-col items-center gap-3">
              <button className="rounded bg-emerald-500 px-8 py-3 font-bold text-black" onClick={startQuickMatch}>
                PLAY
              </button>
              <div className="flex gap-3 text-sm">
                <button className="rounded border border-white/30 px-3 py-1" onClick={() => startBotGame()}>
                  Practice vs Bot
                </button>
                <button className="rounded border border-white/30 px-3 py-1" onClick={() => createRoom()}>
                  Create Room
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="rounded border border-white/30 bg-transparent px-2 py-1 text-sm"
                />
                <button
                  className="rounded border border-white/30 px-3 py-1 text-sm"
                  onClick={() => joinCode && joinRoomByCode(joinCode)}
                >
                  Join Room
                </button>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-white/60">
                <button onClick={() => openOverlay("leaderboard")}>Leaderboard</button>
                <button onClick={() => openOverlay("profile_settings")}>Profile</button>
              </div>
            </div>
          )}

          {state === "matchmaking" && (
            <div className="flex flex-col items-center gap-3">
              <p>Searching for opponent {Math.min(searchTime, 60)}s</p>
              {searchError && <p className="text-rose-400">{searchError}</p>}
              <button className="rounded border border-white/30 px-3 py-1" onClick={cancelQuickMatch}>
                Cancel
              </button>
            </div>
          )}

          {state === "private_lobby" && (
            <div className="flex flex-col items-center gap-3">
              <p>Room: {roomCode}</p>
              <p className="text-sm text-white/70">Players: {roomPlayers.map((p) => p.name).join(", ")}</p>
              {isHost && (
                <button
                  disabled={!roomReady}
                  className="rounded border border-white/30 px-3 py-1 disabled:opacity-40"
                  onClick={() => startRoomGame()}
                >
                  Start Game
                </button>
              )}
            </div>
          )}

          {state === "match_intro" && !isBotMode && (
            <div className="flex flex-col items-center gap-3">
              <p>Toss: {tossPhase}</p>
              {tossPhase === "calling" && (
                <div className="flex gap-2">
                  <button className="rounded border border-white/30 px-3 py-1" onClick={() => roomId && callHeadsOrTails(roomId, "heads")}>
                    Heads
                  </button>
                  <button className="rounded border border-white/30 px-3 py-1" onClick={() => roomId && callHeadsOrTails(roomId, "tails")}>
                    Tails
                  </button>
                </div>
              )}
              {tossPhase === "choosing" && (
                <div className="flex gap-2">
                  <button className="rounded border border-white/30 px-3 py-1" onClick={() => roomId && chooseBatOrBowl(roomId, "bat")}>
                    Bat
                  </button>
                  <button className="rounded border border-white/30 px-3 py-1" onClick={() => roomId && chooseBatOrBowl(roomId, "bowl")}>
                    Bowl
                  </button>
                </div>
              )}
              {tossPhase === "showing-result" && <p>{tossCall}</p>}
            </div>
          )}

          {state === "match_intro" && isBotMode && (
            <p className="text-xl font-bold text-yellow-400">
              You are {activeInning}
            </p>
          )}

          {state === "gameplay" && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-white/70">{activeInning}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    className="h-10 w-10 rounded-full border border-white/40 font-bold"
                    onClick={() =>
                      isBotMode ? playBotMove(n) : roomId && playMultiplayerMove(roomId, n)
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state === "result" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-2xl font-bold">{activeWinner}</p>
              <p>
                {activeScore.user} — {activeScore.opponent}
              </p>
              <div className="flex gap-3">
                <button
                  className="rounded bg-emerald-500 px-4 py-2 font-bold text-black"
                  onClick={() => (isBotMode ? startBotGame() : router.push("/dev/game-client-shell"))}
                >
                  Play Again
                </button>
                <button
                  className="rounded border border-white/30 px-4 py-2"
                  onClick={() => (isBotMode ? endBotMode() : router.push("/dev/game-client-shell"))}
                >
                  Home
                </button>
              </div>
              {!isBotMode && (
                <p className="max-w-xs text-center text-[11px] text-white/40">
                  Multiplayer Home/Play Again reloads this route — useGameSocket has no
                  client-side "return to idle" reset yet (see Phase 1 report).
                </p>
              )}
            </div>
          )}
        </div>
      </InteractionLayer>

      <FeedbackLayer>
        <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-widest text-white/20">feedback</div>
      </FeedbackLayer>

      <OverlayLayer>
        {overlay && (
          <div className="flex h-full w-full items-center justify-center bg-black/70">
            <div className="rounded-lg border border-white/20 bg-black p-6 text-center text-white">
              <p className="mb-4 text-lg font-bold uppercase">{overlay.replace("_", " ")}</p>
              <p className="mb-4 text-sm text-white/60">placeholder — Phase 7</p>
              <button className="rounded border border-white/30 px-3 py-1" onClick={closeOverlay}>
                Close
              </button>
            </div>
          </div>
        )}
      </OverlayLayer>

      <TransitionLayer>
        <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-white/20">transition</div>
      </TransitionLayer>

      <DebugStateOverlay
        state={state}
        matchStatus={`mode=${mode ?? "null"} searching=${searching} opponent=${opponent ?? "—"}`}
        botStatus={`isBotMode=${isBotMode} popup=${showGameStartPopup} gameOver=${botGameOver}`}
        roomStatus={`roomCode=${roomCode ?? "—"} isHost=${isHost} roomReady=${roomReady}`}
      />
    </GameClientShell>
  );
}

export default function GameClientShellHarnessPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <GameClientShellHarnessInner />
    </Suspense>
  );
}
