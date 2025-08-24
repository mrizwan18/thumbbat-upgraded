"use client";

import { useEffect } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useGameSocket } from "@/src/hooks/useGameSocket";
import RoomBanner from "@/components/game/room/RoomBanner";
import TossOverlay from "@/components/game/overlays/TossOverlay";
import InningsOverlay from "@/components/game/overlays/InningsOverlay";
import GameOverModal from "@/components/game/overlays/GameOverModal";
import GameBoard from "@/components/game/board/GameBoard";
import Snackbar from "@/components/ui/Snackbar";

export default function RoomRouteClient({
  intent,
  code,
}: {
  intent: "create" | "join";
  code: string;
}) {
  useAuthGuard("/login?next=/room/" + intent + "/" + code);

  const {
    // room controls
    createRoom,
    joinRoomByCode,
    roomCode,
    roomPlayers,
    roomHostId,
    roomReady,
    isHost,
    roomExpireSeconds,
    copyRoomCode,
    startRoomGame,

    // game state
    roomId,
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
    myName,
    opponent,

    // toss
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

    // snackbar
    joinSnackbar,
    setJoinSnackbar,
  } = useGameSocket();

  // Kick off create/join once on mount
  useEffect(() => {
    if (intent === "create") {
      createRoom(); // will generate + emit, server responds with room:waiting
    } else if (intent === "join") {
      const safeCode = (code || "").toUpperCase();
      if (safeCode) joinRoomByCode(safeCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, code]);

  const activeOpponentName = opponent || "Opponent";
  const canPick = !isGameOver && !hasPickedThisRound;
  const activeRoundCountdown = roundDeadline ? roundCountdown : 0;

  const preGameInRoom = !gameStarted && !!roomCode;

  return (
    <div className="min-h-[100svh] bg-gray-950 text-white relative">
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.18),_transparent)] sm:h-[36rem] sm:w-[36rem] md:h-[42rem] md:w-[42rem]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:36px_36px] sm:bg-[size:42px_42px]" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 pb-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Private Room
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/70">
            Share the code and wait for your friend to join.
          </p>
        </div>

        {preGameInRoom && (
          <div className="mt-6">
            <RoomBanner
              code={roomCode}
              players={roomPlayers}
              isHost={isHost}
              canStart={roomReady}
              expireSeconds={roomExpireSeconds}
              onCopy={copyRoomCode}
              onStart={startRoomGame}
            />
          </div>
        )}

        {/* Toss overlays */}
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

        {/* Game board */}
        {gameStarted ? (
          <div className="mt-6 sm:mt-10">
            <div className="mx-auto w-full max-w-[720px]">
              <GameBoard
                myName={myName}
                opponentName={activeOpponentName}
                inning={inning}
                score={score}
                playerMove={playerMove}
                opponentMove={opponentMove}
                roundCountdown={activeRoundCountdown}
                isMultiplayer
                canPick={canPick}
                onPick={(move) => {
                  if (roomId) playMultiplayerMove(roomId, move);
                }}
                secondInningStarted={secondInningStarted}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Overlays */}
      <InningsOverlay
        open={false}
        firstInningsScore={score.firstInningScore}
        opponentName={activeOpponentName}
        inning={inning}
      />

      <GameOverModal
        open={!!isGameOver}
        winner={winner || ""}
        userScore={score.user}
        opponentScore={score.opponent}
        onExit={() => (window.location.href = "/")}
        onRestart={() => {
          setJoinSnackbar("Create a new room to play again");
          setTimeout(() => setJoinSnackbar(null), 2000);
        }}
      />

      <Snackbar message={joinSnackbar} open={!!joinSnackbar} />
    </div>
  );
}