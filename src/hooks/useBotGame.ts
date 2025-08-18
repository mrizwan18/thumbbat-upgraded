"use client";

import { useCallback, useMemo, useState } from "react";

type Inning = "batting" | "bowling" | null;

type Score = {
  user: number;
  opponent: number;
  firstInningScore: number | null;
};

function clampMove(n: number) {
  return Math.min(6, Math.max(1, Math.floor(n)));
}

/**
 * Full bot game logic: scoring, innings, overlays, winner, and a lightweight adaptive transition matrix.
 */
export function useBotGame(myName: string) {
  const [isBotMode, setIsBotMode] = useState(false);
  const [opponentName] = useState("Rizzwon (Bot)");

  // core game state
  const [inning, setInning] = useState<Inning>(null);
  const [score, setScore] = useState<Score>({ user: 0, opponent: 0, firstInningScore: null });
  const [secondInningStarted, setSecondInningStarted] = useState(false);

  // round/moves
  const [playerMove, setPlayerMove] = useState<number | null>(null);
  const [opponentMove, setOpponentMove] = useState<number | null>(null);

  // overlays & result
  const [showGameStartPopup, setShowGameStartPopup] = useState(false);
  const [showInningsOverlay, setShowInningsOverlay] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // simple “learning” — adapts slightly over time
  const baseMatrix = useMemo(
    () => ({
      batting: {
        pos: {
          1: [0.1, 0.3, 0.2, 0.1, 0.2, 0.1],
          2: [0.2, 0.1, 0.3, 0.1, 0.2, 0.2],
          3: [0.3, 0.1, 0.2, 0.1, 0.2, 0.1],
          4: [0.2, 0.2, 0.1, 0.3, 0.1, 0.1],
          5: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
          6: [0.1, 0.3, 0.2, 0.1, 0.2, 0.1],
        },
        neg: {
          1: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
          2: [0.2, 0.3, 0.1, 0.1, 0.2, 0.2],
          3: [0.1, 0.2, 0.3, 0.1, 0.2, 0.2],
          4: [0.3, 0.2, 0.1, 0.2, 0.1, 0.1],
          5: [0.1, 0.3, 0.2, 0.2, 0.1, 0.2],
          6: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
        },
      },
      bowling: {
        pos: {
          1: [0.2, 0.2, 0.2, 0.1, 0.1, 0.2],
          2: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
          3: [0.2, 0.3, 0.1, 0.2, 0.1, 0.2],
          4: [0.1, 0.2, 0.3, 0.1, 0.1, 0.2],
          5: [0.3, 0.2, 0.1, 0.1, 0.2, 0.1],
          6: [0.1, 0.3, 0.2, 0.1, 0.1, 0.2],
        },
        neg: {
          1: [0.3, 0.1, 0.2, 0.2, 0.1, 0.1],
          2: [0.2, 0.3, 0.1, 0.1, 0.2, 0.1],
          3: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
          4: [0.1, 0.2, 0.2, 0.3, 0.1, 0.1],
          5: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
          6: [0.1, 0.2, 0.1, 0.3, 0.2, 0.1],
        },
      },
    }),
    []
  );

  const [matrix, setMatrix] = useState(baseMatrix);

  const normalize = (arr: number[]) => {
    const sum = arr.reduce((a, b) => a + b, 0) || 1;
    return arr.map((v) => v / sum);
  };

  const adaptMatrix = useCallback(
    (userMove: number, botMove: number, currentInning: Inning) => {
      if (!currentInning) return;

      const diff = score.user - score.opponent;
      const key = diff > 0 ? "pos" : "neg";
      const rowIdx = clampMove(userMove) as 1 | 2 | 3 | 4 | 5 | 6;
      const colIdx = clampMove(botMove) - 1;

      // small nudge so bot doesn’t feel too static
      const copy = structuredClone(matrix);
      copy[currentInning][key][rowIdx][colIdx] += 0.05;
      copy[currentInning][key][rowIdx] = normalize(copy[currentInning][key][rowIdx]);
      setMatrix(copy);
    },
    [matrix, score.user, score.opponent]
  );

  const pickBotMove = useCallback(
    (userMove: number, currentInning: Inning, user: number, opp: number) => {
      if (!currentInning) return clampMove(Math.ceil(Math.random() * 6));
      const diff = user - opp;
      const key = diff > 0 ? "pos" : "neg";
      const row = matrix[currentInning][key][clampMove(userMove) as 1 | 2 | 3 | 4 | 5 | 6] || [1, 1, 1, 1, 1, 1];
      const probs = normalize(row.slice());
      const r = Math.random();
      let acc = 0;
      for (let i = 0; i < probs.length; i++) {
        acc += probs[i];
        if (r <= acc) return i + 1;
      }
      return 1;
    },
    [matrix]
  );

  const resetBotState = useCallback(() => {
    setInning(null);
    setScore({ user: 0, opponent: 0, firstInningScore: null });
    setSecondInningStarted(false);
    setPlayerMove(null);
    setOpponentMove(null);
    setShowInningsOverlay(false);
    setIsGameOver(false);
    setWinner(null);
    setMatrix(baseMatrix);
  }, [baseMatrix]);

  const startBotGame = useCallback(() => {
    resetBotState();
    setIsBotMode(true);
    // randomize who bats first
    const initInning: Inning = Math.random() < 0.5 ? "batting" : "bowling";
    setInning(initInning);
    setShowGameStartPopup(true);
    setTimeout(() => setShowGameStartPopup(false), 1400);
  }, [resetBotState]);

  const endBotMode = useCallback(() => {
    setIsBotMode(false);
  }, []);

  const setInningsAndOverlay = (nextInning: Inning, firstInningsScore: number) => {
    setShowInningsOverlay(true);
    setTimeout(() => {
      setInning(nextInning);
      setSecondInningStarted(true);
      setShowInningsOverlay(false);
    }, 1400);
    setScore((prev) => ({ ...prev, firstInningScore: firstInningsScore }));
  };

  const declareWinner = (userScore: number, opponentScore: number) => {
    setIsGameOver(true);
    const w =
      userScore === opponentScore
        ? "🟡 It's a Draw!"
        : (userScore > opponentScore ? (myName || "You") : opponentName) + " Wins";
    setWinner(w);
  };

  /** Called by UI on click; we do the rest. */
  const playBotMove = (userPick: number) => {
    if (isGameOver || showInningsOverlay || showGameStartPopup || !inning) return;

    const uMove = clampMove(userPick);
    const bot = pickBotMove(uMove, inning, score.user, score.opponent);

    // Show both moves so the board can animate
    setPlayerMove(uMove);
    setOpponentMove(bot);

    // After short delay (to let UI animate), resolve outcome & scoring.
    setTimeout(() => {
      const target = (score.firstInningScore ?? Infinity) + 1;

      if (inning === "batting") {
        if (uMove === bot) {
          // Wicket: end innings
          // First innings end -> store user's score; switch to bowling
          if (!secondInningStarted) {
            setInningsAndOverlay("bowling", score.user);
          } else {
            // Second innings wicket: compare target
            const u = score.user;
            const o = score.opponent;
            if (u >= target) {
              // would already have ended, but keep safe
              declareWinner(u, o);
            } else {
              declareWinner(u, o);
            }
          }
        } else {
          // Runs for user
          const newUser = score.user + uMove;

          if (secondInningStarted) {
            if (newUser >= target) {
              setScore((p) => ({ ...p, user: newUser }));
              declareWinner(newUser, score.opponent);
            } else {
              setScore((p) => ({ ...p, user: newUser }));
            }
          } else {
            setScore((p) => ({ ...p, user: newUser }));
          }
        }
      } else if (inning === "bowling") {
        if (uMove === bot) {
          // Wicket: end innings
          if (!secondInningStarted) {
            // First innings ends while user bowling: store bot score; switch to batting
            setInningsAndOverlay("batting", score.opponent);
          } else {
            // second innings over; compare
            const u = score.user;
            const o = score.opponent;
            declareWinner(u, o);
          }
        } else {
          // Runs for opponent (bot)
          const newOpp = score.opponent + bot;
          if (secondInningStarted) {
            if (newOpp >= target) {
              setScore((p) => ({ ...p, opponent: newOpp }));
              declareWinner(score.user, newOpp);
            } else {
              setScore((p) => ({ ...p, opponent: newOpp }));
            }
          } else {
            setScore((p) => ({ ...p, opponent: newOpp }));
          }
        }
      }

      // Learn a tiny bit from this round
      adaptMatrix(uMove, bot, inning);

      // clear visible moves for next round
      setTimeout(() => {
        setPlayerMove(null);
        setOpponentMove(null);
      }, 150);
    }, 900);
  };

  const canPick =
    !isGameOver && !showInningsOverlay && !showGameStartPopup && inning !== null;

  return {
    // mode
    isBotMode,
    setIsBotMode,
    startBotGame,
    endBotMode,

    // identity
    opponentName,

    // game state
    inning,
    score,
    secondInningStarted,
    playerMove,
    opponentMove,

    // UX
    showGameStartPopup,
    setShowGameStartPopup,
    showInningsOverlay,
    setShowInningsOverlay,
    isGameOver,
    winner,
    canPick,

    // actions
    playBotMove,
  };
}