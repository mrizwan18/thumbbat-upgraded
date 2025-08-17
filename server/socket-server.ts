// server/socket-server.ts
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dbConnect from "./config/db";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

/** ---- Constants ---- */
const TOSS_CALL_TIMEOUT_MS = 5000;
const CHOICE_TIMEOUT_MS = 5000;
const RESULT_REVEAL_MS = 2000;

const ROUND_TIMEOUT_MS = 15000;          // 5s to pick a move
const CLIENT_ANIMATION_MS = 1200;       // clients animate then apply snapshot
const DISCONNECT_GRACE_MS = 20000;      // 20s to reconnect before walkover

type TossCall = "heads" | "tails";
type BatOrBowl = "bat" | "bowl";
type PlayerId = string; // we use socket ids as player IDs at runtime

type PlayerInfo = {
  id: PlayerId;
  name: string;
};

type Scores = Record<PlayerId, number>;

type GameState = {
  inning: 1 | 2;
  battingId: PlayerId;
  bowlingId: PlayerId;
  scores: Scores;
  firstInningScore: number | null;
  secondInningStarted: boolean;
  target: number | null;         // firstInningScore + 1 when inning 2 starts
  gameOver: boolean;
  winnerId?: PlayerId;
};

type RoundState = {
  roundNo: number;
  deadlineAt: number;            // epoch ms when ROUND_TIMEOUT_MS expires
  timer?: NodeJS.Timeout | null;
  moves: Record<PlayerId, number | null>;
};

type RoomState = {
  id: string;
  players: PlayerId[];            // two socket ids
  names: Record<PlayerId, string>;
  // Toss
  callerId?: PlayerId;
  tossCall?: TossCall;
  tossOutcome?: TossCall;
  tossWinnerId?: PlayerId;
  callTimer?: NodeJS.Timeout | null;
  choiceTimer?: NodeJS.Timeout | null;
  // Session resume
  tokens: Record<PlayerId, string>;         // per-player resume token (issued once)
  // Disconnect resilience
  disconnectTimers: Record<PlayerId, NodeJS.Timeout | null>;
  // Game
  game: GameState | null;
  round: RoundState | null;
};

const app = express();
const httpServer = createServer(app);

// CORS for Express
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  allowEIO3: true,
  transports: ["polling", "websocket"],
});

// DB connect
dbConnect()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

/** ---- In-memory state ---- */
const queue: PlayerId[] = []; // socket ids waiting
const rooms = new Map<string, RoomState>(); // roomId -> state
const nameMap = new Map<PlayerId, string>(); // socketId -> name
const socketToRoom = new Map<PlayerId, string>(); // socketId -> roomId

/** ---- Helpers ---- */
const pickRandom = <T,>(arr: T[]): T => arr[crypto.randomInt(0, arr.length)];
const randMove = () => crypto.randomInt(1, 7); // 1..6

function startTimer(ms: number, fn: () => void): NodeJS.Timeout {
  return setTimeout(fn, ms);
}
function clearTimer(t?: NodeJS.Timeout | null) {
  if (t) clearTimeout(t);
}

function peerOf(room: RoomState, sid: PlayerId) {
  return room.players.find((p) => p !== sid)!;
}

function safeEmit(target: PlayerId | PlayerId[], event: string, payload: any) {
  if (Array.isArray(target)) {
    target.forEach((id) => io.to(id).emit(event, payload));
  } else {
    io.to(target).emit(event, payload);
  }
}

function cleanupRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  clearTimer(room.callTimer);
  clearTimer(room.choiceTimer);
  if (room.round?.timer) clearTimer(room.round.timer);
  room.players.forEach((sid) => {
    socketToRoom.delete(sid);
    if (room.disconnectTimers?.[sid]) clearTimer(room.disconnectTimers[sid]);
  });
  rooms.delete(roomId);
}

function tryMatch() {
  while (queue.length >= 2) {
    const a = queue.shift()!;
    const b = queue.shift()!;
    const roomId = `room-${crypto.randomUUID()}`;

    const state: RoomState = {
      id: roomId,
      players: [a, b],
      names: {
        [a]: nameMap.get(a) || `Player-${a.slice(0, 4)}`,
        [b]: nameMap.get(b) || `Player-${b.slice(0, 4)}`,
      },
      callerId: undefined,
      tossCall: undefined,
      tossOutcome: undefined,
      tossWinnerId: undefined,
      callTimer: null,
      choiceTimer: null,
      tokens: {
        [a]: crypto.randomUUID(),
        [b]: crypto.randomUUID(),
      },
      disconnectTimers: { [a]: null, [b]: null },
      game: null,
      round: null,
    };

    rooms.set(roomId, state);
    socketToRoom.set(a, roomId);
    socketToRoom.set(b, roomId);

    io.sockets.sockets.get(a)?.join(roomId);
    io.sockets.sockets.get(b)?.join(roomId);

    // choose caller randomly
    state.callerId = pickRandom([a, b]);

    // Send private session tokens for resume
    safeEmit(a, "session:token", { roomId, token: state.tokens[a] });
    safeEmit(b, "session:token", { roomId, token: state.tokens[b] });

    io.to(roomId).emit("match:found", {
      roomId,
      players: [
        { id: a, name: state.names[a] },
        { id: b, name: state.names[b] },
      ] as PlayerInfo[],
      callerId: state.callerId,
    });

    startToss(state);
  }
}

/** ---- Toss flow ---- */
function startToss(room: RoomState) {
  io.to(room.id).emit("toss:start", {
    roomId: room.id,
    callerId: room.callerId,
    timeoutMs: TOSS_CALL_TIMEOUT_MS,
  });

  room.callTimer = startTimer(TOSS_CALL_TIMEOUT_MS, () => {
    if (!room.tossCall) {
      room.tossCall = pickRandom<TossCall>(["heads", "tails"]);
      resolveToss(room);
    }
  });
}

function resolveToss(room: RoomState) {
  clearTimer(room.callTimer);

  const outcome = pickRandom<TossCall>(["heads", "tails"]);
  room.tossOutcome = outcome;

  const winnerIsCaller = room.tossCall === outcome;
  const winnerId = winnerIsCaller
    ? room.callerId!
    : room.players.find((p) => p !== room.callerId)!;
  room.tossWinnerId = winnerId;

  io.to(room.id).emit("toss:result", {
    roomId: room.id,
    call: room.tossCall,
    outcome,
    winnerId,
  });

  // Reveal for a moment; then ask winner to choose & start timer
  setTimeout(() => {
    room.choiceTimer = startTimer(CHOICE_TIMEOUT_MS, () => {
      finalizeChoice(room, pickRandom<BatOrBowl>(["bat", "bowl"]));
    });

    io.to(winnerId).emit("toss:yourTurnToChoose", {
      roomId: room.id,
      timeoutMs: CHOICE_TIMEOUT_MS,
    });
    io.to(peerOf(room, winnerId)).emit("toss:opponentChoosing", {
      roomId: room.id,
      timeoutMs: CHOICE_TIMEOUT_MS,
    });
  }, RESULT_REVEAL_MS);
}

function finalizeChoice(room: RoomState, choice: BatOrBowl) {
  clearTimer(room.choiceTimer);

  const battingId =
    choice === "bat"
      ? room.tossWinnerId!
      : room.players.find((p) => p !== room.tossWinnerId)!;
  const bowlingId = room.players.find((p) => p !== battingId)!;

  // Initialize game state (authoritative)
  room.game = {
    inning: 1,
    battingId,
    bowlingId,
    scores: { [battingId]: 0, [bowlingId]: 0 },
    firstInningScore: null,
    secondInningStarted: false,
    target: null,
    gameOver: false,
  };
  room.round = null;

  io.to(room.id).emit("toss:final", {
    roomId: room.id,
    winnerId: room.tossWinnerId,
    choice,
    battingId,
    bowlingId,
  });

  // Begin first round
  startRound(room);
}

/** ---- Round / Move loop ---- */

function startRound(room: RoomState) {
  if (!room.game || room.game.gameOver) return;

  // create a new round
  const roundNo = (room.round?.roundNo || 0) + 1;
  const deadlineAt = Date.now() + ROUND_TIMEOUT_MS;
  const moves: Record<PlayerId, number | null> = {
    [room.game.battingId]: null,
    [room.game.bowlingId]: null,
  };

  // clear any previous timer
  if (room.round?.timer) clearTimer(room.round.timer);

  room.round = {
    roundNo,
    deadlineAt,
    timer: startTimer(ROUND_TIMEOUT_MS, () => finalizeRound(room, "timeout")),
    moves,
  };

  // Broadcast round start + authoritative snapshot
  io.to(room.id).emit("move:roundStart", {
    roomId: room.id,
    round: roundNo,
    deadlineAt,
    snapshot: packSnapshot(room),
  });
}

function finalizeRound(room: RoomState, reason: "bothSelected" | "timeout") {
  const g = room.game!;
  const r = room.round!;
  if (!g || !r) return;
  clearTimer(r.timer);

  // Fill any missing moves with auto-picks
  (Object.keys(r.moves) as PlayerId[]).forEach((pid) => {
    if (r.moves[pid] == null) r.moves[pid] = randMove();
  });

  const battingId = g.battingId;
  const bowlingId = g.bowlingId;
  const batMove = r.moves[battingId]!;
  const bowlMove = r.moves[bowlingId]!;

  // Compute outcome per your rules
  type Outcome =
    | { type: "runs"; runsAdded: number }
    | { type: "wicketFirstInnings" }
    | { type: "wicketSecondInnings"; winnerId: PlayerId | null } // null means tie
    | { type: "chaseComplete"; winnerId: PlayerId }
    | { type: "inningsSwitch" }; // sent when we move from 1->2

  let outcome: Outcome;

  if (g.inning === 1) {
    if (batMove === bowlMove) {
      // Wicket -> first innings ends, store score, switch innings
      g.firstInningScore = g.scores[battingId];
      g.inning = 2;
      g.secondInningStarted = true;
      g.target = g.firstInningScore + 1;

      // swap roles
      const newBatting = bowlingId;
      const newBowling = battingId;
      g.battingId = newBatting;
      g.bowlingId = newBowling;

      outcome = { type: "wicketFirstInnings" };
    } else {
      // Runs scored = batter's move
      g.scores[battingId] += batMove;
      outcome = { type: "runs", runsAdded: batMove };
    }
  } else {
    // Inning 2 (chase)
    if (batMove === bowlMove) {
      // Wicket on chase -> check if target was already reached
      // (Normally we'd have ended earlier if target reached.)
      const chasingScore = g.scores[battingId];
      const target = g.target ?? Number.MAX_SAFE_INTEGER;

      if (chasingScore >= target) {
        g.gameOver = true;
        g.winnerId = battingId;
        outcome = { type: "wicketSecondInnings", winnerId: battingId };
      } else {
        // Chasing out below target -> bowling side wins
        g.gameOver = true;
        g.winnerId = bowlingId;
        outcome = { type: "wicketSecondInnings", winnerId: bowlingId };
      }
    } else {
      // Add runs and check chase completion
      g.scores[battingId] += batMove;
      const target = g.target ?? Number.MAX_SAFE_INTEGER;

      if (g.scores[battingId] >= target) {
        g.gameOver = true;
        g.winnerId = battingId;
        outcome = { type: "chaseComplete", winnerId: battingId };
      } else {
        outcome = { type: "runs", runsAdded: batMove };
      }
    }
  }

  // Tell clients the two moves + outcome. Clients will animate for CLIENT_ANIMATION_MS,
  // then apply the snapshot we include (authoritative).
  io.to(room.id).emit("move:roundResult", {
    roomId: room.id,
    round: r.roundNo,
    moves: {
      [battingId]: batMove,
      [bowlingId]: bowlMove,
    },
    outcome,
    applyAfterMs: CLIENT_ANIMATION_MS,
    snapshot: packSnapshot(room),
  });

  // If game continues, start next round after clients finish animation
  if (!g.gameOver) {
    // If we just switched innings, we still start a new round
    setTimeout(() => startRound(room), CLIENT_ANIMATION_MS + 100);
  } else {
    // Game over -> cleanup room after a short delay (optional)
    setTimeout(() => cleanupRoom(room.id), 15000);
  }
}

function packSnapshot(room: RoomState) {
  const g = room.game;
  if (!g) return null;

  return {
    inning: g.inning,
    battingId: g.battingId,
    bowlingId: g.bowlingId,
    scores: g.scores,
    firstInningScore: g.firstInningScore,
    secondInningStarted: g.secondInningStarted,
    target: g.target,
    gameOver: g.gameOver,
    winnerId: g.winnerId ?? null,
  };
}

/** ---- Socket handlers ---- */
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("me:setName", (name: string) => {
    const trimmed = (name || "").toString().trim();
    nameMap.set(socket.id, trimmed || `Player-${socket.id.slice(0, 4)}`);
  });

  socket.on("queue:join", () => {
    if (!queue.includes(socket.id)) {
      queue.push(socket.id);
      tryMatch();
    }
  });

  socket.on("queue:leave", () => {
    const i = queue.indexOf(socket.id);
    if (i >= 0) queue.splice(i, 1);
  });

  // Toss events
  socket.on("toss:call", (p: { roomId: string; call: TossCall }) => {
    const room = rooms.get(p.roomId);
    if (!room || room.callerId !== socket.id) return;
    if (room.tossCall) return;
    room.tossCall = p.call;
    resolveToss(room);
  });

  socket.on("toss:choose", (p: { roomId: string; choice: BatOrBowl }) => {
    const room = rooms.get(p.roomId);
    if (!room || room.tossWinnerId !== socket.id) return;
    finalizeChoice(room, p.choice);
  });

  // --- Real-time moves ---
  socket.on("move:select", (p: { roomId: string; move: number }) => {
    const room = rooms.get(p.roomId);
    if (!room || !room.game || !room.round) return;
    const g = room.game;
    const r = room.round;

    // Validate move + deadline + player role
    if (Date.now() > r.deadlineAt) return; // too late
    const isPlayer = room.players.includes(socket.id);
    if (!isPlayer) return;
    if (p.move < 1 || p.move > 6) return;

    // Only first selection counts
    if (r.moves[socket.id] != null) return;

    r.moves[socket.id] = p.move;

    // If both picked early, finalize now
    const bothPicked = Object.values(r.moves).every((m) => m != null);
    if (bothPicked) {
      finalizeRound(room, "bothSelected");
    }
  });

  // --- Resume support: client presents roomId + token to rebind ---
  socket.on("resume:join", (p: { roomId: string; token: string; name?: string }) => {
    const room = rooms.get(p.roomId);
    if (!room) return;

    // Find which player slot matches this token
    const match = Object.entries(room.tokens).find(([, tok]) => tok === p.token);
    if (!match) {
      safeEmit(socket.id, "resume:failed", { reason: "invalid_token_or_room" });
      return;
    }
    const [oldPlayerId] = match;

    // If the old socket is still around, cleanly remove it from the room
    const oldSock = io.sockets.sockets.get(oldPlayerId);
    if (oldSock) {
      try {
        oldSock.leave(room.id);
        safeEmit(oldPlayerId, "session:replaced", { roomId: room.id });
        // optional: oldSock.disconnect(true);
      } catch {}
    }

    // Update name
    const newName = (p.name || room.names[oldPlayerId] || `Player-${socket.id.slice(0, 4)}`).toString();
    nameMap.set(socket.id, newName);
    room.names[socket.id] = newName;

    // Move mappings: socketToRoom
    socketToRoom.delete(oldPlayerId);
    socketToRoom.set(socket.id, room.id);

    // Replace old id in players array
    const idx = room.players.indexOf(oldPlayerId);
    if (idx >= 0) room.players[idx] = socket.id;

    // Keep the same resume token but rebind it to the new socket id
    room.tokens[socket.id] = room.tokens[oldPlayerId];
    delete room.tokens[oldPlayerId];

    // Rebind game roles/scores if a game exists
    if (room.game) {
      const g = room.game;
      if (g.battingId === oldPlayerId) g.battingId = socket.id;
      if (g.bowlingId === oldPlayerId) g.bowlingId = socket.id;
      g.scores[socket.id] = g.scores[oldPlayerId] ?? 0;
      delete g.scores[oldPlayerId];
    }

    // Rebind current round move (if any)
    if (room.round) {
      const r = room.round;
      r.moves[socket.id] = r.moves[oldPlayerId] ?? null;
      delete r.moves[oldPlayerId];
    }

    // Join the room
    io.sockets.sockets.get(socket.id)?.join(room.id);

    // Cancel any walkover/disconnect timer for this slot and re-init mapping
    if (room.disconnectTimers[oldPlayerId]) clearTimer(room.disconnectTimers[oldPlayerId]);
    room.disconnectTimers[socket.id] = null;
    delete room.disconnectTimers[oldPlayerId];

    // Send either a live snapshot (game on) or a pre-game toss state
    const snapshot = packSnapshot(room); // may be null before game starts
    if (snapshot) {
      safeEmit(socket.id, "state:snapshot", {
        roomId: room.id,
        snapshot,
        round: room.round
          ? { round: room.round.roundNo, deadlineAt: room.round.deadlineAt }
          : null,
      });
    } else {
      const phase = room.tossWinnerId
        ? "awaitingChoice"
        : room.tossCall
        ? "resolvingToss"
        : "awaitingTossCall";

      safeEmit(socket.id, "state:pregame", {
        roomId: room.id,
        phase, // "awaitingTossCall" | "resolvingToss" | "awaitingChoice"
        callerId: room.callerId ?? null,
        tossCall: room.tossCall ?? null,
        tossOutcome: room.tossOutcome ?? null,
        winnerId: room.tossWinnerId ?? null,
      });
    }

    // Acknowledge resume success
    safeEmit(socket.id, "resume:ok", { roomId: room.id, name: newName });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // remove from queue
    const i = queue.indexOf(socket.id);
    if (i >= 0) queue.splice(i, 1);

    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    // Start grace timer; if not resumed within DISCONNECT_GRACE_MS -> walkover
    room.disconnectTimers[socket.id] = startTimer(DISCONNECT_GRACE_MS, () => {
      const peer = peerOf(room, socket.id);
      safeEmit(peer, "opponent:left", { roomId });
      // Declare walkover winner immediately, if game started
      if (room.game && !room.game.gameOver) {
        room.game.gameOver = true;
        room.game.winnerId = peer;
        io.to(room.id).emit("game:walkover", {
          roomId,
          winnerId: peer,
          snapshot: packSnapshot(room),
        });
      }
      cleanupRoom(roomId);
    });

    nameMap.delete(socket.id);
  });
});

// WebSocket error handler
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});