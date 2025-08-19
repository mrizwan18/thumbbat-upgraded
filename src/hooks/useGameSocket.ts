"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/src/lib/socket";
import type { RoundStartPayload, Snapshot } from "@/src/types/realtime";

type TossPhase =
  | "idle"
  | "calling"
  | "waiting-call"
  | "showing-result"
  | "choosing"
  | "waiting-choice"
  | "done";

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const myIdRef = useRef<string>("");
  const opponentIdRef = useRef<string>("");

  const [myName, setMyName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("username") || "You";
    }
    return "You";
  });
  const [opponent, setOpponent] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  /** -------- Lobby -------- */
  const [mode, setMode] = useState<"player" | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Quick match timers (browser returns number for setInterval/setTimeout)
  const searchTickRef = useRef<number | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchStartedAtRef = useRef<number>(0);

  /** -------- Private room waiting -------- */
  const [waiting, setWaiting] = useState<null | { code: string; expiresAt: number }>(null);
  const [waitCountdown, setWaitCountdown] = useState<number>(0);
  const waitTimerRef = useRef<number | null>(null);

  /** -------- Game -------- */
  const [gameStarted, setGameStarted] = useState(false);
  const [inning, setInning] = useState<"batting" | "bowling" | null>(null);
  const [score, setScore] = useState({
    user: 0,
    opponent: 0,
    firstInningScore: null as number | null,
  });
  const [playerMove, setPlayerMove] = useState<number | null>(null);
  const [opponentMove, setOpponentMove] = useState<number | null>(null);
  const [secondInningStarted, setSecondInningStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  /** -------- Round -------- */
  const [roundDeadline, setRoundDeadline] = useState<number | null>(null);
  const [roundCountdown, setRoundCountdown] = useState<number>(0);
  const [hasPickedThisRound, setHasPickedThisRound] = useState(false);
  const roundTimerRef = useRef<number | null>(null);

  /** -------- Toss -------- */
  const [tossPhase, setTossPhase] = useState<TossPhase>("idle");
  const [tossCountdown, setTossCountdown] = useState<number>(0);
  const [iChooseCountdown, setIChooseCountdown] = useState<number>(0);
  const [tossCall, setTossCall] = useState<"heads" | "tails" | null>(null);
  const [tossOutcome, setTossOutcome] = useState<"heads" | "tails" | null>(null);
  const [tossWinnerId, setTossWinnerId] = useState<string | null>(null);

  /** ================== Socket init & listeners ================== */
  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    s.on("connect", () => {
      myIdRef.current = s.id || "";
      const nm =
        (typeof window !== "undefined" && localStorage.getItem("username")) ||
        `Player-${s.id?.slice(0, 4)}`;
      setMyName(nm);
      s.emit("me:setName", nm);
      s.emit("me:setUser", {
        userId: typeof window !== "undefined" ? localStorage.getItem("userId") : null,
        name: nm,
      });
    });

    // session token for resume
    s.on("session:token", ({ roomId: rid, token }: { roomId: string; token: string }) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("mp_roomId", rid);
        localStorage.setItem("mp_token", token);
      }
    });

    // match found
    s.on("match:found", (payload: { roomId: string; players: { id: string; name: string }[]; callerId: string }) => {
      setRoomId(payload.roomId);
      const me = s.id;
      const opp = payload.players.find((p) => p.id !== me);
      opponentIdRef.current = opp?.id ?? "";
      setOpponent(opp?.name || "Opponent");

      // STOP quick-match timers immediately
      clearSearchTimers();
      setSearching(false);
      setSearchTime(0);
      setSearchError(null);

      setWaiting(null);
      setTossPhase("idle");
    });

    /** ---------- Toss ---------- */
    s.on("toss:start", ({ callerId, timeoutMs }: { callerId: string; timeoutMs: number }) => {
      setTossPhase(callerId === s.id ? "calling" : "waiting-call");
      startSimpleCountdown(timeoutMs, setTossCountdown);
    });
    s.on("toss:result", ({ call, outcome, winnerId }: any) => {
      setTossPhase("showing-result");
      setTossCall(call);
      setTossOutcome(outcome);
      setTossWinnerId(winnerId);
    });
    s.on("toss:yourTurnToChoose", ({ timeoutMs }: { timeoutMs: number }) => {
      setTossPhase("choosing");
      startSimpleCountdown(timeoutMs, setIChooseCountdown);
    });
    s.on("toss:opponentChoosing", ({ timeoutMs }: { timeoutMs: number }) => {
      setTossPhase("waiting-choice");
      startSimpleCountdown(timeoutMs, setIChooseCountdown);
    });
    s.on("toss:final", ({ battingId }: { battingId: string }) => {
      setTossPhase("done");
      const iBat = battingId === s.id;
      setInning(iBat ? "batting" : "bowling");
      setGameStarted(true);
    });

    /** ---------- Rounds ---------- */
    s.on("move:roundStart", ({ deadlineAt, snapshot }: RoundStartPayload) => {
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

      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
      roundTimerRef.current = startCountdownTo(deadlineAt, setRoundCountdown);
    });

    s.on(
      "move:roundResult",
      ({
        moves,
        applyAfterMs,
        snapshot,
      }: {
        moves: Record<string, number>;
        applyAfterMs: number;
        snapshot: Snapshot;
      }) => {
        const myId = myIdRef.current;
        const oppId = opponentIdRef.current;

        // show chosen numbers immediately for visuals; scoring comes after applyAfterMs
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
            const winName = snapshot.winnerId === myId ? myName || "You" : opponent || "Opponent";
            setWinner(`${winName} Wins`);
          }

          // reset per round
          setPlayerMove(null);
          setOpponentMove(null);
          setHasPickedThisRound(false);
          setRoundDeadline(null);
          setRoundCountdown(0);
        }, applyAfterMs);
      }
    );

    s.on("state:snapshot", ({ snapshot }: { snapshot: Snapshot }) => {
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
    });

    /** ---------- Waiting room lifecycle ---------- */
    s.on("room:waiting", (p: { code: string; roomId: string; expiresAt: number }) => {
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
      waitTimerRef.current = window.setInterval(tick, 250);
    });
    s.on("room:timeout", () => {
      setWaiting(null);
      if (waitTimerRef.current) {
        clearInterval(waitTimerRef.current);
        waitTimerRef.current = null;
      }
    });
    s.on("room:exists", ({ code }: any) => {
      setWaiting(null);
      alert(`Room ${code} already exists. Try joining instead.`);
    });
    s.on("room:notFound", ({ code }: any) => {
      setWaiting(null);
      alert(`Room ${code} not found.`);
    });
    s.on("room:full", ({ code }: any) => {
      setWaiting(null);
      alert(`Room ${code} is full.`);
    });

    /** ---------- Disconnects ---------- */
    s.on("opponent:left", () => {
      setIsGameOver(true);
      setWinner("Opponent left. You win by walkover 🏆");
    });
    s.on("game:walkover", () => {
      setIsGameOver(true);
      setWinner("Opponent left. You win by walkover 🏆");
    });

    return () => {
      s.removeAllListeners();
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
      if (waitTimerRef.current) clearInterval(waitTimerRef.current);
      clearSearchTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ================== helpers ================== */
  const startSimpleCountdown = (ms: number, setter: (n: number) => void) => {
    const total = Math.ceil(ms / 1000);
    setter(total);
    let left = total;
    const int = window.setInterval(() => {
      left -= 1;
      setter(left);
      if (left <= 0) clearInterval(int);
    }, 1000);
  };

  const startCountdownTo = (deadline: number, setter: (n: number) => void) => {
    setter(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    const int = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setter(left);
      if (left <= 0) clearInterval(int);
    }, 250);
    return int;
  };

  /** ================== Quick Match timer control ================== */
  const clearSearchTimers = () => {
    if (searchTickRef.current) {
      clearInterval(searchTickRef.current);
      searchTickRef.current = null;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  };

  const handleSearchTimeout = () => {
    clearSearchTimers();
    try {
      socketRef.current?.emit("queue:leave");
    } catch {}
    setSearching(false);
    setMode(null);
    setSearchTime(60); // lock UI at 60s
    setSearchError("No player is active right now. Please try again.");
  };

  /** ================== actions (lobby) ================== */
  const startQuickMatch = () => {
    clearSearchTimers();
    setSearchError(null);
    setSearchTime(0);
    setSearching(true);
    setMode("player");

    socketRef.current?.emit("me:setName", myName);
    socketRef.current?.emit("me:setUser", {
      userId: typeof window !== "undefined" ? localStorage.getItem("userId") : null,
      name: myName,
    });
    socketRef.current?.emit("queue:join");

    searchStartedAtRef.current = Date.now();

    // 1s tick
    searchTickRef.current = window.setInterval(() => {
      const secs = Math.floor((Date.now() - searchStartedAtRef.current) / 1000);
      if (secs >= 60) {
        handleSearchTimeout();
      } else {
        setSearchTime(secs);
      }
    }, 1000);

    // hard timeout safety
    searchTimeoutRef.current = window.setTimeout(handleSearchTimeout, 60_000);
  };

  const cancelQuickMatch = () => {
    clearSearchTimers();
    socketRef.current?.emit("queue:leave");
    setSearching(false);
    setMode(null);
    setSearchTime(0);
    setSearchError(null);
  };

  /** ================== actions (private room) ================== */
  const createRoom = async () => {
    const c = genCode();
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(c);
    } catch {}
    setMode("player");
    socketRef.current?.emit("room:create", { code: c, name: myName });
  };

  const joinRoomByCode = (code: string) => {
    const c = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length < 4 || c.length > 8) {
      alert("Enter a 4–8 character code");
      return;
    }
    setMode("player");
    socketRef.current?.emit("room:joinByCode", { code: c, name: myName });
  };

  const cancelWaiting = (code: string) => {
    socketRef.current?.emit("room:leave", { code });
    setWaiting(null);
  };

  /** ================== actions (toss) ================== */
  const callHeadsOrTails = (rid: string, call: "heads" | "tails") => {
    socketRef.current?.emit("toss:call", { roomId: rid, call });
  };
  const chooseBatOrBowl = (rid: string, choice: "bat" | "bowl") => {
    socketRef.current?.emit("toss:choose", { roomId: rid, choice });
  };

  /** ================== actions (move) ================== */
  const playMultiplayerMove = (rid: string, move: number) => {
    if (hasPickedThisRound || !roundDeadline || Date.now() > roundDeadline) return;
    socketRef.current?.emit("move:select", { roomId: rid, move });
    setHasPickedThisRound(true);
    setPlayerMove(move);
  };

  /** ================== utils ================== */
  const genCode = (len = 6) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  };

  return {
    // identity
    myName,
    opponent,
    roomId,
    // lobby
    mode,
    searching,
    searchTime,
    searchError,
    startQuickMatch,
    cancelQuickMatch,
    // private rooms
    createRoom,
    joinRoomByCode,
    waiting,
    waitCountdown,
    cancelWaiting,
    // game state
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
  };
}