"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Scoreboard from "@/components/Scoreboard";
import MoveSelection from "@/components/MoveSelection";
import OpponentMoveDisplay from "@/components/OpponentMoveDisplay";
import GameMoveImages from "@/components/GameMoveImages";
import opStartImg from "@/public/images/start-r.png";
import plStartImg from "@/public/images/start.png";
import { getSocket } from "@/src/lib/socket";

type TossPhase = "idle" | "calling" | "waiting-call" | "showing-result" | "choosing" | "waiting-choice" | "done";

const Game = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"bot" | "player" | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState<{
    user: number;
    opponent: number;
    firstInningScore: number | null;
  }>({
    user: 0,
    opponent: 0,
    firstInningScore: null,
  });
  const [inning, setInning] = useState<"batting" | "bowling" | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [opponentMove, setOpponentMove] = useState<number | null>(null);
  const [playerMove, setPlayerMove] = useState<number | null>(null);
  const [secondInningStarted, setSecondInningStarted] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // ✅ Game over popup
  const [showInningsOverlay, setShowInningsOverlay] = useState(false); // ✅ Innings transition popup
  const [showGameStartPopup, setShowGameStartPopup] = useState(false); // ✅ New: Game start popup
  const [playerMovesHistory, setPlayerMovesHistory] = useState<number[]>([]);
  const [botMovesHistory, setBotMovesHistory] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  const [tossPhase, setTossPhase] = useState<TossPhase>("idle");
  const [callerId, setCallerId] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [tossCountdown, setTossCountdown] = useState<number>(0);
  const [tossCall, setTossCall] = useState<"heads" | "tails" | null>(null);
  const [tossOutcome, setTossOutcome] = useState<"heads" | "tails" | null>(null);
  const [tossWinnerId, setTossWinnerId] = useState<string | null>(null);
  const [iChooseCountdown, setIChooseCountdown] = useState<number>(0);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const myId = useMemo(() => {
    return socketRef.current?.id || "";
  }, [socketRef.current?.id]);

  const myName = useMemo(() => localStorage.getItem("username") || "You", []);

  useEffect(() => {
    if (!searching) return;
  
    setSearchError(null);
    setSearchTime(0);
  
    const startedAt = Date.now();
  
    const int = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt) / 1000);
      setSearchTime(secs);
    }, 1000);
  
    const kill = setTimeout(() => {
      // tell server we're leaving the queue
      try {
        const s = socketRef.current;
        s?.emit("queue:leave");
      } catch {}
  
      // reset UI
      setSearching(false);
      setMode(null);
      setSearchTime(0);
      setSearchError("No player is active right now. Please try again.");
    }, 60_000);
  
    return () => {
      clearInterval(int);
      clearTimeout(kill);
    };
  }, [searching]);

  const restartGame = () => {
    setMode(null);
    setSearching(false);
    setSearchTime(0);
    setGameStarted(false);
    setScore({ user: 0, opponent: 0, firstInningScore: null });
    setInning(null);
    setIsGameOver(false);
    setWinner(null);
    setPlayerMove(null);
    setOpponentMove(null);
    setSecondInningStarted(false);
    setShowPopup(false);
    setShowInningsOverlay(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  const startPlayerSearch = () => {
    restartGame();
    setMode("player");
    setSearching(true);
    setSearchTime(0);

    const s = getSocket();
    socketRef.current = s;

    s.emit("me:setName", myName);
    s.emit("queue:join");

    // match found
    s.on("match:found", (payload: {
      roomId: string;
      players: { id: string; name: string }[];
      callerId: string;
    }) => {
      setSearching(false);
      setOpponent(payload.players.find(p => p.id !== s.id)?.name || "Opponent");
      setRoomId(payload.roomId);
      setCallerId(payload.callerId);
      setIsCaller(payload.callerId === s.id);
      // tell UI to start toss
    });

    // toss start
    s.on("toss:start", ({ roomId, callerId, timeoutMs }: { roomId: string; callerId: string; timeoutMs: number }) => {
      setTossPhase(callerId === s.id ? "calling" : "waiting-call");
      startCountdown(timeoutMs, setTossCountdown);
    });

    // toss result
    s.on("toss:result", (p: { roomId: string; call: "heads" | "tails"; outcome: "heads" | "tails"; winnerId: string }) => {
      setTossPhase("showing-result");
      setTossCall(p.call);
      setTossOutcome(p.outcome);
      setTossWinnerId(p.winnerId);
    });

    // winner chooses
    s.on("toss:yourTurnToChoose", ({ timeoutMs }: { timeoutMs: number }) => {
      setTossPhase("choosing");
      startCountdown(timeoutMs, setIChooseCountdown);
    });
    s.on("toss:opponentChoosing", ({ timeoutMs }: { timeoutMs: number }) => {
      setTossPhase("waiting-choice");
      startCountdown(timeoutMs, setIChooseCountdown);
    });

    // final
    s.on("toss:final", (p: {
      roomId: string;
      winnerId: string;
      choice: "bat" | "bowl";
      battingId: string;
      bowlingId: string;
    }) => {
      setTossPhase("done");
      // map to your existing state:
      const iBat = p.battingId === s.id;
      setInning(iBat ? "batting" : "bowling");
      setGameStarted(true); // enter your normal game screen
      // (you can also show a small “You’re batting/bowling” popup)
    });

    s.on("opponent:left", () => {
      setSearching(false);
      setShowPopup(true);
      setWinner("Opponent left. You win by walkover ");
      setIsGameOver(true);
    });
  };

  // helper: countdowns
  const startCountdown = (ms: number, setter: (n: number) => void) => {
    const total = Math.ceil(ms / 1000);
    setter(total);
    let left = total;
    const int = setInterval(() => {
      left -= 1;
      setter(left);
      if (left <= 0) clearInterval(int);
    }, 1000);
  };

  const callHeadsOrTails = (call: "heads" | "tails") => {
    if (!roomId || !socketRef.current) return;
    setTossCall(call);
    socketRef.current.emit("toss:call", { roomId, call });
  };

  const chooseBatOrBowl = (choice: "bat" | "bowl") => {
    if (!roomId || !socketRef.current) return;
    socketRef.current.emit("toss:choose", { roomId, choice });
  };

  // Example of a more sophisticated transition matrix considering move, inning, and score difference
  const transitionMatrix = {
    batting: {
      scoreDifferencePositive: {
        1: [0.1, 0.3, 0.2, 0.1, 0.2, 0.1],
        2: [0.2, 0.1, 0.3, 0.1, 0.2, 0.2],
        3: [0.3, 0.1, 0.2, 0.1, 0.2, 0.1],
        4: [0.2, 0.2, 0.1, 0.3, 0.1, 0.1],
        5: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
        6: [0.1, 0.3, 0.2, 0.1, 0.2, 0.1],
      },
      scoreDifferenceNegative: {
        1: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
        2: [0.2, 0.3, 0.1, 0.1, 0.2, 0.2],
        3: [0.1, 0.2, 0.3, 0.1, 0.2, 0.2],
        4: [0.3, 0.2, 0.1, 0.2, 0.1, 0.1],
        5: [0.1, 0.3, 0.2, 0.2, 0.1, 0.2],
        6: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
      },
    },
    bowling: {
      scoreDifferencePositive: {
        1: [0.2, 0.2, 0.2, 0.1, 0.1, 0.2],
        2: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
        3: [0.2, 0.3, 0.1, 0.2, 0.1, 0.2],
        4: [0.1, 0.2, 0.3, 0.1, 0.1, 0.2],
        5: [0.3, 0.2, 0.1, 0.1, 0.2, 0.1],
        6: [0.1, 0.3, 0.2, 0.1, 0.1, 0.2],
      },
      scoreDifferenceNegative: {
        1: [0.3, 0.1, 0.2, 0.2, 0.1, 0.1],
        2: [0.2, 0.3, 0.1, 0.1, 0.2, 0.1],
        3: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
        4: [0.1, 0.2, 0.2, 0.3, 0.1, 0.1],
        5: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
        6: [0.1, 0.2, 0.1, 0.3, 0.2, 0.1],
      },
    },
  };

  const getBotMove = (
    playerMove: number,
    inning: "batting" | "bowling",
    scoreDifference: number
  ) => {
    const scoreDifferenceKey =
      scoreDifference > 0
        ? "scoreDifferencePositive"
        : "scoreDifferenceNegative";

    const transition = transitionMatrix[inning][scoreDifferenceKey];

    const probabilities = transition[playerMove as keyof typeof transition];

    const randomValue = Math.random();

    let cumulativeProbability = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];

      if (randomValue < cumulativeProbability) {
        return i + 1;
      }
    }

    return 1;
  };

  const startBotGame = () => {
    restartGame();
    setMode("bot");
    setGameStarted(true);
    setOpponent("Rizzwon (Bot)");
    const initialInning = Math.random() < 0.5 ? "batting" : "bowling";
    setInning(initialInning);
    setShowGameStartPopup(true); // ✅ Show game start popup

    setTimeout(() => {
      setShowGameStartPopup(false);
    }, 3000);
  };

  const playMove = (move: number) => {
    if (
      isGameOver ||
      isAnimating ||
      !gameStarted ||
      showInningsOverlay ||
      showPopup ||
      showGameStartPopup
    )
      return;

    setPlayerMove(move);
    setPlayerMovesHistory((prevHistory) => [...prevHistory, move]);

    if (mode === "bot") {
      setIsAnimating(true);

      const scoreDifference = score.user - score.opponent;

      if (inning === "batting" || inning === "bowling") {
        const botMove = getBotMove(move, inning, scoreDifference);
        setOpponentMove(botMove);
        setBotMovesHistory((prevHistory) => [...prevHistory, botMove]);
        handleGameLogic(move, botMove);
      }
    }
    setTimeout(() => {
      setIsAnimating(false);
    }, 1200);
  };

  const declareWinner = (userScore: number, opponentScore: number) => {
    setIsGameOver(true);
    setShowPopup(true);

    let winnerMessage = "🟡 It's a Draw!";
    if (userScore === opponentScore) {
      setWinner(winnerMessage);
    } else {
      winnerMessage =
        userScore > opponentScore
          ? localStorage.getItem("username") || "Player"
          : opponent || "Opponent";
      setWinner(winnerMessage + " Wins");
    }

    updateTransitionMatrix();
  };

  const handleGameLogic = (userMove: number, opponentMove: number) => {
    if (!userMove || !opponentMove || isGameOver) return;
    let playerAnimationComplete = false;
    let opponentAnimationComplete = false;
    const checkAndProcessMoves = () => {
      if (!playerAnimationComplete || !opponentAnimationComplete) return;
      if (inning === "batting") {
        // ✅ If moves are different, update batting player's score
        if (userMove !== opponentMove) {
          setScore((prev) => {
            const newScore = prev.user + userMove;

            // ✅ If second innings & score surpasses first innings, end game
            if (
              secondInningStarted &&
              prev.firstInningScore !== null &&
              newScore > prev.firstInningScore
            ) {
              setTimeout(() => {
                declareWinner(newScore, score.opponent);
              }, 1000);
            }

            return { ...prev, user: newScore };
          });
        } else {
          setTimeout(() => {
            // ✅ If moves are the same, end the innings
            setOpponentMove(null);
            setPlayerMove(null);
            if (!secondInningStarted) {
              // ✅ First innings over, store the score and switch innings
              setScore((prev) => ({ ...prev, firstInningScore: prev.user }));
              setShowInningsOverlay(true);

              setTimeout(() => {
                setInning("bowling"); // Switch innings
                setSecondInningStarted(true);
                setShowInningsOverlay(false);
              }, 3000);
            } else {
              // ✅ Second innings over, check scores and declare winner
              setScore((prev) => ({ ...prev, firstInningScore: prev.user }));
              declareWinner(score.user, score.opponent);
            }
          }, 1000);
        }
      } else {
        // ✅ If moves are different, update opponent's score

        if (userMove !== opponentMove) {
          setScore((prev) => {
            const newOpponentScore = prev.opponent + opponentMove;

            // ✅ If second innings & score surpasses first innings, end game
            if (
              secondInningStarted &&
              prev.firstInningScore !== null &&
              newOpponentScore > prev.firstInningScore
            ) {
              setTimeout(() => {
                declareWinner(score.user, newOpponentScore);
              }, 1000);
            }

            return { ...prev, opponent: newOpponentScore };
          });
        } else {
          setTimeout(() => {
            // ✅ If moves are same, end the innings
            setOpponentMove(null);
            setPlayerMove(null);
            if (!secondInningStarted) {
              // ✅ If first innings ends when the user was bowling, start second innings correctly
              setScore((prev) => ({
                ...prev,
                firstInningScore: prev.opponent,
              }));
              setShowInningsOverlay(true);

              setTimeout(() => {
                setInning("batting"); // Switch innings
                setSecondInningStarted(true);
                setShowInningsOverlay(false);
              }, 3000);
            } else {
              // ✅ Second innings over, check scores and declare winner
              setScore((prev) => ({ ...prev, firstInningScore: prev.user }));
              declareWinner(score.user, score.opponent);
            }
          }, 1000);
        }
      }

      setOpponentMove(null);
      setPlayerMove(null);
    };
    // Set animation completion handlers
    playerAnimationComplete = false;
    opponentAnimationComplete = false;

    // Trigger animations and wait for completion
    setTimeout(() => {
      playerAnimationComplete = true;
      checkAndProcessMoves();
    }, 1000);

    setTimeout(() => {
      opponentAnimationComplete = true;
      checkAndProcessMoves();
    }, 1000);
  };

  const updateTransitionMatrix = () => {
    for (let i = 0; i < playerMovesHistory.length; i++) {
      const playerMove = playerMovesHistory[i];
      const botMove = botMovesHistory[i];

      if (inning === "batting" && botMove !== playerMove) {
        transitionMatrix[inning]["scoreDifferencePositive"][
          playerMove as 1 | 2 | 3 | 4 | 5 | 6
        ][botMove - 1] += 0.1;
      } else if (inning === "bowling" && playerMove !== botMove) {
        transitionMatrix[inning]["scoreDifferenceNegative"][
          playerMove as 1 | 2 | 3 | 4 | 5 | 6
        ][botMove - 1] += 0.1;
      }
    }

    normalizeTransitionMatrix();
  };

  const normalizeTransitionMatrix = () => {
    (
      Object.keys(transitionMatrix) as Array<keyof typeof transitionMatrix>
    ).forEach((inning) => {
      (
        Object.keys(transitionMatrix[inning]) as Array<
          keyof (typeof transitionMatrix)[typeof inning]
        >
      ).forEach((scoreDiff) => {
        (
          Object.keys(transitionMatrix[inning][scoreDiff]).map(Number) as Array<
            keyof (typeof transitionMatrix)[typeof inning][typeof scoreDiff]
          >
        ).forEach((move) => {
          const total = transitionMatrix[inning][scoreDiff][move].reduce(
            (acc: number, val: number) => acc + val,
            0
          );
          transitionMatrix[inning][scoreDiff][move] = transitionMatrix[inning][
            scoreDiff
          ][move].map((val: number) => val / total);
        });
      });
    });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-4xl font-bold mb-6">🎮 Play the Game</h2>

        {!mode && !gameStarted && (
          <div className="flex gap-6 relative">
            <button
              className="bg-blue-500 px-6 py-3 rounded text-white text-lg font-semibold"
              onClick={startBotGame}
            >
              Play Against Rizzwon, the Bot 🤖
            </button>
            <div className="relative">
              <button className="bg-green-500 px-6 py-3 rounded text-white text-lg font-semibold "
              onClick={startPlayerSearch}>
                Play Against Player 🏏
              </button>
            </div>
          </div>
        )}

        {!mode && !gameStarted && searchError && (
          <p className="mt-3 text-sm text-red-300">{searchError}</p>
        )}
        {searching && (
          <div className="text-lg mt-4">
            Searching for a player...{" "}
            <span className="text-yellow-400">{searchTime}s</span>
          </div>
        )}

        {/* TOSS OVERLAYS (only in multiplayer before gameStarted) */}
        {mode === "player" && !gameStarted && tossPhase !== "idle" && tossPhase !== "done" && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-[92%] max-w-md text-center">
              {tossPhase === "calling" && (
                <>
                  <h3 className="text-2xl font-bold mb-4">🪙 Your call!</h3>
                  <p className="mb-3">Choose heads or tails</p>
                  <div className="flex gap-4 justify-center mb-4">
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded"
                      onClick={() => callHeadsOrTails("heads")}
                    >
                      Heads
                    </button>
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded"
                      onClick={() => callHeadsOrTails("tails")}
                    >
                      Tails
                    </button>
                  </div>
                  <p className="text-sm opacity-80">Auto-pick in {tossCountdown}s…</p>
                </>
              )}

              {tossPhase === "waiting-call" && (
                <>
                  <h3 className="text-2xl font-bold mb-2">🪙 Waiting for opponent to call…</h3>
                  <p className="text-sm opacity-80">Auto-pick for them in {tossCountdown}s</p>
                </>
              )}

              {tossPhase === "showing-result" && (
                <>
                  <h3 className="text-2xl font-bold mb-3">🪙 Toss Result</h3>
                  <p className="mb-1">Call: <span className="text-yellow-300">{tossCall}</span></p>
                  <p className="mb-3">Outcome: <span className="text-green-300">{tossOutcome}</span></p>
                  <p>{tossWinnerId === socketRef.current?.id ? "You won the toss!" : `${opponent} won the toss.`}</p>
                </>
              )}

              {tossPhase === "choosing" && (
                <>
                  <h3 className="text-2xl font-bold mb-3">You won—choose your start</h3>
                  <div className="flex gap-4 justify-center mb-4">
                    <button
                      className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded"
                      onClick={() => chooseBatOrBowl("bat")}
                    >
                      Bat First
                    </button>
                    <button
                      className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded"
                      onClick={() => chooseBatOrBowl("bowl")}
                    >
                      Bowl First
                    </button>
                  </div>
                  <p className="text-sm opacity-80">Auto-pick in {iChooseCountdown}s…</p>
                </>
              )}

              {tossPhase === "waiting-choice" && (
                <>
                  <h3 className="text-2xl font-bold mb-2">Opponent is choosing…</h3>
                  <p className="text-sm opacity-80">Auto-pick in {iChooseCountdown}s</p>
                </>
              )}
            </div>
          </div>
        )}

        {gameStarted && (
          <>
            <p className="text-xl mb-2">
              {localStorage.getItem("username")}, you are{" "}
              <span className="text-yellow-400">{inning}</span>
            </p>

            <Scoreboard
              userScore={score.user}
              opponentScore={score.opponent}
              opponentName={opponent || "Opponent"}
            />
            <div className="flex justify-center gap-6 mb-4">
              <GameMoveImages
                playerMove={playerMove === null ? 0 : playerMove}
                opponentMove={opponentMove === null ? 0 : opponentMove}
                isPlayer={true}
                startImage={plStartImg.src}
              />
              <GameMoveImages
                playerMove={playerMove === null ? 0 : playerMove}
                opponentMove={opponentMove === null ? 0 : opponentMove}
                isPlayer={false}
                startImage={opStartImg.src}
              />
            </div>
            <MoveSelection
              playerMove={playerMove === null ? 0 : playerMove}
              playMove={playMove}
              isDisabled={
                isGameOver ||
                isAnimating ||
                !gameStarted ||
                showInningsOverlay ||
                showPopup ||
                showGameStartPopup
              }
            />
            {playerMove && opponentMove && (
              <OpponentMoveDisplay
                opponent={opponent || "Opponent"}
                opponentMove={opponentMove === null ? 0 : opponentMove}
                isAnimating={isAnimating}
              />
            )}
          </>
        )}

        {/* ✅ Game Start Popup */}
        {showGameStartPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-2xl font-bold text-yellow-400">
                🏏 Cricket Gods Have Chosen You for{" "}
                <span className="text-green-400">{inning}</span>
              </h3>
            </div>
          </div>
        )}
        {/* ✅ Innings Transition Overlay */}
        {showInningsOverlay && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-2xl font-bold text-yellow-400">
                🏏 Innings Over!
              </h3>
              <p className="text-lg mt-2">
                First innings score: {score.firstInningScore}
              </p>
              <p className="text-lg">
                Now {opponent}&apos;s time for {inning}. Target:{" "}
                {score.firstInningScore ? score.firstInningScore + 1 : 0}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Game Over Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-3xl font-bold text-yellow-400">{winner}🏆</h3>
              <p className="text-lg mt-2">
                Final Score: {score.user} - {score.opponent}
              </p>

              {/* ✅ Exit & Restart Buttons */}
              <div className="mt-4 flex justify-center gap-4">
                <button
                  className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white font-semibold"
                  onClick={() => router.push("/")}
                >
                  Exit
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold"
                  onClick={startBotGame}
                >
                  Restart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
