"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Scoreboard from "@/components/Scoreboard";
import MoveSelection from "@/components/MoveSelection";
import OpponentMoveDisplay from "@/components/OpponentMoveDisplay";
import GameMoveImages from "@/components/GameMoveImages";
import { getSocket } from "@/src/lib/socket";
import type { RoundStartPayload, Snapshot } from "@/src/types/realtime";
import type { Socket } from "socket.io-client";

export default function GamePage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Game />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-[100svh] grid place-items-center bg-gray-950 text-white">
      <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
        Loading game…
      </div>
    </div>
  );
}

type TossPhase =
  | "idle"
  | "calling"
  | "waiting-call"
  | "showing-result"
  | "choosing"
  | "waiting-choice"
  | "done";

const opStartImg = "/images/start-r.png";
const plStartImg = "/images/start.png";

function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"bot" | "player" | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [opponent, setOpponent] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const [score, setScore] = useState({
    user: 0,
    opponent: 0,
    firstInningScore: null as number | null,
  });
  const [inning, setInning] = useState<"batting" | "bowling" | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const [opponentMove, setOpponentMove] = useState<number | null>(null);
  const [playerMove, setPlayerMove] = useState<number | null>(null);
  const [secondInningStarted, setSecondInningStarted] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [showInningsOverlay, setShowInningsOverlay] = useState(false);
  const [showGameStartPopup, setShowGameStartPopup] = useState(false);

  const [roundDeadline, setRoundDeadline] = useState<number | null>(null);
  const [roundCountdown, setRoundCountdown] = useState<number>(0);
  const [hasPickedThisRound, setHasPickedThisRound] = useState(false);

  const [tossPhase, setTossPhase] = useState<TossPhase>("idle");
  const [tossCountdown, setTossCountdown] = useState<number>(0);
  const [tossCall, setTossCall] = useState<"heads" | "tails" | null>(null);
  const [tossOutcome, setTossOutcome] = useState<"heads" | "tails" | null>(null);
  const [tossWinnerId, setTossWinnerId] = useState<string | null>(null);
  const [iChooseCountdown, setIChooseCountdown] = useState<number>(0);

  const [waiting, setWaiting] = useState<null | { code: string; expiresAt: number }>(null);
  const [waitCountdown, setWaitCountdown] = useState<number>(0);
  const waitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [roomId, setRoomId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const myIdRef = useRef<string>("");
  const opponentIdRef = useRef<string>("");
  const cancelRoundCountdownRef = useRef<null | (() => void)>(null);

  const [myName, setMyName] = useState("You");

  // Require login for /game
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login?next=/game");
    }
  }, [router]);

  // Load username
  useEffect(() => {
    const n = localStorage.getItem("username");
    if (n) setMyName(n);
  }, []);

  // Ensure socket exists & identify
  useEffect(() => {
    if (!socketRef.current) {
      const s = getSocket();
      socketRef.current = s;
      s.on("connect", () => (myIdRef.current = s.id || ""));
      const nm = localStorage.getItem("username") || `Player-${s.id?.slice(0, 4)}`;
      s.emit("me:setName", nm);
      s.emit("me:setUser", {
        userId: localStorage.getItem("userId"),
        name: nm,
      });
    }
  }, []);

  // Resume session if token available
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const rid = localStorage.getItem("mp_roomId");
    const tok = localStorage.getItem("mp_token");
    if (rid && tok) s.emit("resume:join", { roomId: rid, token: tok, name: myName });
  }, [myName]);

  // Handle ?host / ?join
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const host = searchParams.get("host");
    const join = searchParams.get("join");
    if (host) s.emit("room:create", { code: host.toUpperCase(), name: myName });
    if (join) s.emit("room:joinByCode", { code: join.toUpperCase(), name: myName });
  }, [searchParams, myName]);

  // Searching timers
  useEffect(() => {
    if (!searching) return;
    setSearchError(null);
    setSearchTime(0);
    const start = Date.now();
    const t = setInterval(() => setSearchTime(Math.floor((Date.now() - start) / 1000)), 1000);
    const kill = setTimeout(() => {
      socketRef.current?.emit("queue:leave");
      setSearching(false);
      setMode(null);
      setSearchTime(0);
      setSearchError("No player is active right now. Please try again.");
    }, 60_000);
    return () => {
      clearInterval(t);
      clearTimeout(kill);
    };
  }, [searching]);

  // Central socket handlers
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const runCountdownTo = (deadlineMs: number, setter: (n: number) => void) => {
      setter(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
      const int = setInterval(() => {
        const left = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
        setter(left);
        if (left <= 0) clearInterval(int);
      }, 250);
      return () => clearInterval(int);
    };

    // Room lifecycle (join/create)
    const onWaiting = (p: { code: string; roomId: string; expiresAt: number }) => {
      setRoomId(p.roomId);
      setWaiting({ code: p.code, expiresAt: p.expiresAt });
      if (waitTimerRef.current) clearInterval(waitTimerRef.current);
      const tick = () => {
        const ms = Math.max(0, p.expiresAt - Date.now());
        setWaitCountdown(Math.ceil(ms / 1000));
        if (ms <= 0 && waitTimerRef.current) {
          clearInterval(waitTimerRef.current);
          waitTimerRef.current = null;
        }
      };
      tick();
      waitTimerRef.current = setInterval(tick, 250);
    };
    const onTimeout = () => {
      setWaiting(null);
      if (waitTimerRef.current) {
        clearInterval(waitTimerRef.current);
        waitTimerRef.current = null;
      }
      router.replace("/game?m=timeout");
    };
    const onExists = (p: { code: string }) => {
      setWaiting(null);
      alert(`Room ${p.code} already exists. Try joining instead.`);
      router.replace("/game");
    };
    const onNotFound = (p: { code: string }) => {
      setWaiting(null);
      alert(`Room ${p.code} not found.`);
      router.replace("/game");
    };
    const onFull = (p: { code: string }) => {
      setWaiting(null);
      alert(`Room ${p.code} is full.`);
      router.replace("/game");
    };

    const onMatchFound = (payload: {
      roomId: string;
      players: { id: string; name: string }[];
      callerId: string;
    }) => {
      setRoomId(payload.roomId);
      const me = s.id;
      const opp = payload.players.find((p) => p.id !== me);
      opponentIdRef.current = opp?.id ?? "";
      setOpponent(opp?.name || "Opponent");
      setSearching(false);
      setWaiting(null);
      setTossPhase("idle");
    };

    const onRoundStart = ({ deadlineAt, snapshot }: RoundStartPayload) => {
      const myId = myIdRef.current;
      const oppId = opponentIdRef.current;
      const scores = snapshot.scores as Record<string, number>;
      const iBat = snapshot.battingId === myId;
      setInning(iBat ? "batting" : "bowling");
      setScore({
        user: scores[myId] ?? 0,
        opponent: scores[oppId] ?? 0,
        firstInningScore: snapshot.firstInningScore,
      });
      setSecondInningStarted(snapshot.secondInningStarted);
      setHasPickedThisRound(false);
      setRoundDeadline(deadlineAt);
      if (cancelRoundCountdownRef.current) cancelRoundCountdownRef.current();
      cancelRoundCountdownRef.current = runCountdownTo(deadlineAt, setRoundCountdown);
    };

    const onRoundResult = ({
      moves,
      applyAfterMs,
      snapshot,
    }: {
      moves: Record<string, number>;
      outcome: any;
      applyAfterMs: number;
      snapshot: Snapshot;
    }) => {
      const myId = myIdRef.current;
      const oppId = opponentIdRef.current;
      setPlayerMove(moves[myId]);
      setOpponentMove(moves[oppId]);
      setTimeout(() => {
        const scores = snapshot.scores;
        const iBat = snapshot.battingId === myId;
        setInning(iBat ? "batting" : "bowling");
        setScore({
          user: scores[myId] ?? 0,
          opponent: scores[oppId] ?? 0,
          firstInningScore: snapshot.firstInningScore,
        });
        setSecondInningStarted(snapshot.secondInningStarted);
        if (snapshot.gameOver) {
          setIsGameOver(true);
          setShowPopup(true);
          const winName = snapshot.winnerId === myId ? myName || "You" : opponent || "Opponent";
          setWinner(`${winName} Wins`);
        }
        setPlayerMove(null);
        setOpponentMove(null);
        setHasPickedThisRound(false);
        setRoundDeadline(null);
        setRoundCountdown(0);
      }, applyAfterMs);
    };

    const onStateSnapshot = ({ snapshot }: { snapshot: Snapshot; round: { round: number; deadlineAt: number } | null }) => {
      const myId = s.id!;
      const oppId = opponentIdRef.current;
      setInning(snapshot.battingId === myId ? "batting" : "bowling");
      setScore({
        user: snapshot.scores[myId] ?? 0,
        opponent: snapshot.scores[oppId] ?? 0,
        firstInningScore: snapshot.firstInningScore,
      });
      setSecondInningStarted(snapshot.secondInningStarted);
      setGameStarted(!snapshot.gameOver);
    };

    const onTossStart = ({ callerId, timeoutMs }: { callerId: string; timeoutMs: number }) => {
      setTossPhase(callerId === s.id ? "calling" : "waiting-call");
      startCountdown(timeoutMs, setTossCountdown);
    };
    const onTossResult = (p: { call: "heads" | "tails"; outcome: "heads" | "tails"; winnerId: string }) => {
      setTossPhase("showing-result");
      setTossCall(p.call);
      setTossOutcome(p.outcome);
      setTossWinnerId(p.winnerId);
    };
    const onYourTurnToChoose = ({ timeoutMs }: { timeoutMs: number }) => {
      setTossPhase("choosing");
      startCountdown(timeoutMs, setIChooseCountdown);
    };
    const onOpponentChoosing = ({ timeoutMs }: { timeoutMs: number }) => {
      setTossPhase("waiting-choice");
      startCountdown(timeoutMs, setIChooseCountdown);
    };
    const onTossFinal = (p: { battingId: string; bowlingId: string }) => {
      setTossPhase("done");
      const iBat = p.battingId === s.id;
      setInning(iBat ? "batting" : "bowling");
      setGameStarted(true);
    };

    const onOpponentLeft = () => {
      setIsGameOver(true);
      setShowPopup(true);
      setWinner("Opponent left. You win by walkover 🏆");
    };
    const onWalkover = onOpponentLeft;

    const onSessionToken = ({ roomId: rid, token }: { roomId: string; token: string }) => {
      localStorage.setItem("mp_roomId", rid);
      localStorage.setItem("mp_token", token);
    };

    s.on("room:waiting", onWaiting);
    s.on("room:timeout", onTimeout);
    s.on("room:exists", onExists);
    s.on("room:notFound", onNotFound);
    s.on("room:full", onFull);
    s.on("match:found", onMatchFound);

    s.on("move:roundStart", onRoundStart);
    s.on("move:roundResult", onRoundResult);
    s.on("state:snapshot", onStateSnapshot);

    s.on("toss:start", onTossStart);
    s.on("toss:result", onTossResult);
    s.on("toss:yourTurnToChoose", onYourTurnToChoose);
    s.on("toss:opponentChoosing", onOpponentChoosing);
    s.on("toss:final", onTossFinal);

    s.on("opponent:left", onOpponentLeft);
    s.on("game:walkover", onWalkover);
    s.on("session:token", onSessionToken);

    return () => {
      s.off("room:waiting", onWaiting);
      s.off("room:timeout", onTimeout);
      s.off("room:exists", onExists);
      s.off("room:notFound", onNotFound);
      s.off("room:full", onFull);
      s.off("match:found", onMatchFound);

      s.off("move:roundStart", onRoundStart);
      s.off("move:roundResult", onRoundResult);
      s.off("state:snapshot", onStateSnapshot);

      s.off("toss:start", onTossStart);
      s.off("toss:result", onTossResult);
      s.off("toss:yourTurnToChoose", onYourTurnToChoose);
      s.off("toss:opponentChoosing", onOpponentChoosing);
      s.off("toss:final", onTossFinal);

      s.off("opponent:left", onOpponentLeft);
      s.off("game:walkover", onWalkover);
      s.off("session:token", onSessionToken);
    };
  }, [router, myName, opponent]);

  /* ------------------------------ Helpers ------------------------------ */

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
    setTossPhase("idle");
  };

  /* --------------------------- Quick Match (Queue) --------------------------- */

  const startPlayerSearch = () => {
    restartGame();
    setMode("player");
    setSearching(true);
    const s = socketRef.current || getSocket();
    socketRef.current = s;
    s.emit("me:setName", myName);
    s.emit("me:setUser", { userId: localStorage.getItem("userId"), name: myName });
    s.emit("queue:join");
  };

  const cancelPlayerSearch = () => {
    socketRef.current?.emit("queue:leave");
    setSearching(false);
    setMode(null);
    setSearchTime(0);
  };

  /* ----------------------------- Bot Gameplay ----------------------------- */

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

  const getBotMove = (playerMove: number, inn: "batting" | "bowling", diff: number) => {
    const key = diff > 0 ? "scoreDifferencePositive" : "scoreDifferenceNegative";
    const probs = transitionMatrix[inn][key][playerMove as 1 | 2 | 3 | 4 | 5 | 6];
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < probs.length; i++) {
      cum += probs[i];
      if (r < cum) return i + 1;
    }
    return 1;
  };

  const startBotGame = () => {
    restartGame();
    setMode("bot");
    setGameStarted(true);
    setOpponent("Rizzwon (Bot)");
    setInning(Math.random() < 0.5 ? "batting" : "bowling");
    setShowGameStartPopup(true);
    setTimeout(() => setShowGameStartPopup(false), 1800);
  };

  const playMove = (move: number) => {
    if (isGameOver || !gameStarted || showInningsOverlay || showPopup || showGameStartPopup) return;
    setPlayerMove(move);

    if (mode === "player") {
      if (hasPickedThisRound || !roundDeadline || Date.now() > roundDeadline) return;
      if (!roomId) return;
      socketRef.current?.emit("move:select", { roomId, move });
      setHasPickedThisRound(true);
      return;
    }

    // Bot logic
    const diff = score.user - score.opponent;
    const botMove = getBotMove(move, inning!, diff);
    setOpponentMove(botMove);

    setTimeout(() => {
      if (inning === "batting") {
        if (move !== botMove) {
          setScore((p) => {
            const newScore = p.user + move;
            if (secondInningStarted && p.firstInningScore !== null && newScore > p.firstInningScore) {
              setTimeout(() => declareWinner(newScore, score.opponent), 700);
            }
            return { ...p, user: newScore };
          });
        } else {
          if (!secondInningStarted) {
            setScore((p) => ({ ...p, firstInningScore: p.user }));
            setShowInningsOverlay(true);
            setTimeout(() => {
              setInning("bowling");
              setSecondInningStarted(true);
              setShowInningsOverlay(false);
            }, 1500);
          } else {
            declareWinner(score.user, score.opponent);
          }
        }
      } else {
        if (move !== botMove) {
          setScore((p) => {
            const newOpp = p.opponent + botMove;
            if (secondInningStarted && p.firstInningScore !== null && newOpp > p.firstInningScore) {
              setTimeout(() => declareWinner(score.user, newOpp), 700);
            }
            return { ...p, opponent: newOpp };
          });
        } else {
          if (!secondInningStarted) {
            setScore((p) => ({ ...p, firstInningScore: p.opponent }));
            setShowInningsOverlay(true);
            setTimeout(() => {
              setInning("batting");
              setSecondInningStarted(true);
              setShowInningsOverlay(false);
            }, 1500);
          } else {
            declareWinner(score.user, score.opponent);
          }
        }
      }
      setPlayerMove(null);
      setOpponentMove(null);
    }, 1000);
  };

  const declareWinner = (userScore: number, opponentScore: number) => {
    setIsGameOver(true);
    setShowPopup(true);
    if (userScore === opponentScore) setWinner("🟡 It's a Draw!");
    else setWinner((userScore > opponentScore ? myName : opponent || "Opponent") + " Wins");
  };

  /* -------------------------- Join/Create Room Card -------------------------- */

  function JoinRoomCard() {
    const [code, setCode] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const s = socketRef.current || getSocket();
    if (!socketRef.current) socketRef.current = s;

    const ensureIdentified = () => {
      s.emit("me:setName", myName);
      s.emit("me:setUser", { userId: localStorage.getItem("userId"), name: myName });
    };

    const genCode = (len = 6) => {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let out = "";
      for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
      return out;
    };

    const join = (e: React.FormEvent) => {
      e.preventDefault();
      setErr(null);
      const c = normalized;
      if (c.length < 4 || c.length > 8) return setErr("Enter a 4–8 character code");
      ensureIdentified();
      setMode("player");
      s.emit("room:joinByCode", { code: c, name: myName });
    };

    const create = async () => {
      const c = genCode();
      try {
        if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(c);
        setToast(`Room code copied: ${c}`);
      } catch {
        setToast(`Room code: ${c}`);
      } finally {
        setTimeout(() => setToast(null), 2200);
      }
      ensureIdentified();
      setMode("player");
      s.emit("room:create", { code: c, name: myName });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-lime-400/10 to-amber-300/10 p-6 md:p-8 backdrop-blur-xl"
      >
        <h3 className="text-xl md:text-2xl font-bold tracking-tight">Play with a friend</h3>
        <p className="mt-1 text-sm text-white/70">Create a private room and share the code, or join one.</p>

        <form onSubmit={join} className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code (e.g. 7F2B)"
            className="w-full rounded-2xl border border-white/10 bg-gray-900/60 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/60"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
          >
            Join room
          </button>
        </form>

        <div className="mt-3">
          <button
            onClick={create}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-white/90 hover:bg-white/5 transition-colors"
          >
            Create private room
          </button>
        </div>

        {err && <p className="mt-2 text-sm text-amber-300">{err}</p>}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-block rounded-xl bg-gray-900/90 px-3 py-2 text-xs text-white/90 border border-white/10"
          >
            {toast}
          </motion.div>
        )}
      </motion.div>
    );
  }

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <div className="min-h-[100svh] bg-gray-950 text-white">
      {/* background fx */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.22),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06)1px,transparent_1px,transparent_3px)]" />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Play ThumbBat</h1>
          <p className="mt-2 text-white/70">Quick match, private room, or solo vs bot.</p>
        </div>

        {/* Lobby cards */}
        {!waiting && !mode && !gameStarted && (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Quick Match */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <h3 className="text-xl font-semibold">Quick Match</h3>
              <p className="mt-1 text-sm text-white/70">We’ll find someone for you right now.</p>
              <div className="mt-4 flex items-center gap-3">
                {!searching ? (
                  <button
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
                    onClick={startPlayerSearch}
                  >
                    Find opponent
                  </button>
                ) : (
                  <>
                    <span className="text-sm text-white/80">
                      Searching… <span className="text-yellow-300">{searchTime}s</span>
                    </span>
                    <button
                      onClick={cancelPlayerSearch}
                      className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
              {searchError && <p className="mt-2 text-sm text-rose-300">{searchError}</p>}
              <div className="mt-4 text-xs text-white/50">1 minute timeout if no match.</div>
            </motion.div>

            {/* Join/Create */}
            <JoinRoomCard />

            {/* Play vs Bot */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <h3 className="text-xl font-semibold">Solo Practice</h3>
              <p className="mt-1 text-sm text-white/70">Warm up against Rizzwon 🤖</p>
              <div className="mt-4">
                <button
                  onClick={startBotGame}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(129,140,248,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
                >
                  Play vs Bot
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Waiting overlay (hosted/joined private room until opponent arrives) */}
        <AnimatePresence>
          {waiting && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="rounded-2xl border border-white/10 bg-gray-900 p-6 w-[90%] max-w-md text-center">
                <h3 className="text-xl font-semibold">Waiting for an opponent…</h3>
                <p className="mt-2 text-white/70">
                  Room code: <span className="font-mono">{waiting.code}</span>
                </p>
                <p className="mt-1 text-white/70">Expires in {waitCountdown}s</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    className="rounded-2xl border border-white/15 px-4 py-2 hover:bg-white/5"
                    onClick={() => {
                      const s = socketRef.current;
                      if (s) s.emit("room:leave", { code: waiting.code });
                      setWaiting(null);
                      if (waitTimerRef.current) {
                        clearInterval(waitTimerRef.current);
                        waitTimerRef.current = null;
                      }
                      router.replace("/game");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toss overlays (multiplayer pre-game) */}
        {mode === "player" && !gameStarted && tossPhase !== "idle" && tossPhase !== "done" && (
          <div className="fixed inset-0 bg-black/70 grid place-items-center z-40">
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-[92%] max-w-md text-center">
              {tossPhase === "calling" && (
                <>
                  <h3 className="text-2xl font-bold mb-4">🪙 Your call!</h3>
                  <div className="flex gap-4 justify-center mb-4">
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded"
                      onClick={() => {
                        if (!roomId) return;
                        setTossCall("heads");
                        socketRef.current?.emit("toss:call", { roomId, call: "heads" });
                      }}
                    >
                      Heads
                    </button>
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded"
                      onClick={() => {
                        if (!roomId) return;
                        setTossCall("tails");
                        socketRef.current?.emit("toss:call", { roomId, call: "tails" });
                      }}
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
                  <p>{tossWinnerId === socketRef.current?.id ? "You won the toss!" : `${opponent ?? "Opponent"} won the toss.`}</p>
                </>
              )}

              {tossPhase === "choosing" && (
                <>
                  <h3 className="text-2xl font-bold mb-3">You won—choose your start</h3>
                <div className="flex gap-4 justify-center mb-4">
                    <button
                      className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded"
                      onClick={() => {
                        if (!roomId) return;
                        socketRef.current?.emit("toss:choose", { roomId, choice: "bat" });
                      }}
                    >
                      Bat First
                    </button>
                    <button
                      className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded"
                      onClick={() => {
                        if (!roomId) return;
                        socketRef.current?.emit("toss:choose", { roomId, choice: "bowl" });
                      }}
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

        {/* Game UI */}
        {gameStarted && (
          <div className="mt-10 grid grid-cols-1 gap-6">
            <div className="text-center">
              <p className="text-lg">
                {myName}, you are <span className="text-yellow-400">{inning}</span>
              </p>
            </div>

            <Scoreboard userScore={score.user} opponentScore={score.opponent} opponentName={opponent || "Opponent"} />

            <div className="flex justify-center gap-6 mb-2">
              <GameMoveImages playerMove={playerMove ?? 0} opponentMove={opponentMove ?? 0} isPlayer={true} startImage={plStartImg} />
              <GameMoveImages playerMove={playerMove ?? 0} opponentMove={opponentMove ?? 0} isPlayer={false} startImage={opStartImg} />
            </div>

            <div className="flex flex-col items-center">
              <MoveSelection
                playerMove={playerMove ?? 0}
                playMove={playMove}
                isDisabled={
                  isGameOver ||
                  !gameStarted ||
                  showInningsOverlay ||
                  showPopup ||
                  showGameStartPopup ||
                  (mode === "player" && hasPickedThisRound)
                }
              />

              {mode === "player" && roundDeadline && !isGameOver && (
                <p className="mt-2 text-sm opacity-80">
                  Pick your move in <span className="text-yellow-400">{roundCountdown}s</span>
                </p>
              )}

              {playerMove && opponentMove && (
                <OpponentMoveDisplay opponent={opponent || "Opponent"} opponentMove={opponentMove ?? 0} isAnimating={false} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Start popup */}
      <AnimatePresence>
        {showGameStartPopup && (
          <motion.div className="fixed inset-0 bg-gray-950/80 grid place-items-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-2xl font-bold text-yellow-400">
                🏏 Cricket Gods chose you for <span className="text-green-400">{inning}</span>
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Innings overlay */}
      <AnimatePresence>
        {showInningsOverlay && (
          <motion.div className="fixed inset-0 bg-gray-950/80 grid place-items-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-2xl font-bold text-yellow-400">🏏 Innings Over!</h3>
              <p className="text-lg mt-2">First innings score: {score.firstInningScore}</p>
              <p className="text-lg">
                Now {opponent}&apos;s time for {inning}. Target: {score.firstInningScore ? score.firstInningScore + 1 : 0}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div className="fixed inset-0 bg-gray-950/80 grid place-items-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-3xl font-bold text-yellow-400">{winner}🏆</h3>
              <p className="text-lg mt-2">
                Final Score: {score.user} - {score.opponent}
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white font-semibold" onClick={() => router.push("/")}>
                  Exit
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold" onClick={startBotGame}>
                  Restart (vs Bot)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}