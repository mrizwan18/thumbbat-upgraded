"use client";

import { useEffect } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useGameSocket } from "@/src/hooks/useGameSocket";
import GameShell from "@/components/game/GameShell";

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

  const header = (
    <>
      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
        Private Room
      </h1>
      <p className="mt-2 text-sm sm:text-base text-white/70">
        Share the code and wait for your friend to join.
      </p>
    </>
  );

  const roomBanner = preGameInRoom
    ? {
        code: roomCode,
        players: roomPlayers,
        isHost,
        canStart: roomReady,
        expireSeconds: roomExpireSeconds,
        onCopy: copyRoomCode,
        onStart: startRoomGame,
      }
    : null;

  const toss =
    !gameStarted && tossPhase !== "idle" && tossPhase !== "done"
      ? {
          phase: tossPhase,
          tossCountdown,
          iChooseCountdown,
          tossCall,
          tossOutcome,
          youWon: undefined,
          opponentName: activeOpponentName,
          onCall: (call: "heads" | "tails") => {
            if (roomId) callHeadsOrTails(roomId, call);
          },
          onChoose: (choice: "bat" | "bowl") => {
            if (roomId) chooseBatOrBowl(roomId, choice);
          },
        }
      : null;

  const board = gameStarted
    ? {
        myName,
        opponentName: activeOpponentName,
        inning,
        score,
        playerMove,
        opponentMove,
        roundCountdown: activeRoundCountdown,
        isMultiplayer: true,
        canPick,
        onPick: (move: number) => {
          if (roomId) playMultiplayerMove(roomId, move);
        },
        secondInningStarted,
      }
    : null;

  return (
    <GameShell
      header={header}
      roomBanner={roomBanner}
      toss={toss}
      board={board}
      innings={{
        open: false,
        firstInningsScore: score.firstInningScore,
        opponentName: activeOpponentName,
        inning,
      }}
      gameOver={{
        open: !!isGameOver,
        winner: winner || "",
        userScore: score.user,
        opponentScore: score.opponent,
        onExit: () => (window.location.href = "/"),
        onRestart: () => {
          setJoinSnackbar("Create a new room to play again");
          setTimeout(() => setJoinSnackbar(null), 2000);
        },
      }}
      snackbar={{ message: joinSnackbar, open: !!joinSnackbar }}
    />
  );
}
