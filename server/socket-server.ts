// server/socket-server.ts
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dbConnect from "./config/db";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import mongoose from "mongoose";
import Match from "./models/Match";
import User from "./models/User";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

/** ---- Constants ---- */
const TOSS_CALL_TIMEOUT_MS = 15000;
const CHOICE_TIMEOUT_MS = 15000;
const RESULT_REVEAL_MS = 5000;

const ROUND_TIMEOUT_MS = 15000;     // 15s to pick a move
const CLIENT_ANIMATION_MS = 1500;   // clients animate, then apply snapshot
const DISCONNECT_GRACE_MS = 20000;  // 20s to reconnect before walkover

const ROOM_WAIT_MS = 300_000;        // private room: 5 minutes to find second player

const codeToRoomId = new Map<string, string>(); // code -> roomId

type TossCall = "heads" | "tails";
type BatOrBowl = "bat" | "bowl";
type PlayerId = string;

type PlayerInfo = { id: PlayerId; name: string };
type Scores = Record<PlayerId, number>;

type GameState = {
  inning: 1 | 2;
  battingId: PlayerId;
  bowlingId: PlayerId;
  scores: Scores;
  firstInningScore: number | null;
  secondInningStarted: boolean;
  target: number | null;
  gameOver: boolean;
  winnerId?: PlayerId;
};

type RoundState = {
  roundNo: number;
  deadlineAt: number;
  timer?: NodeJS.Timeout | null;
  moves: Record<PlayerId, number | null>;
};

type RoomState = {
  id: string;
  code?: string;
  hostId: PlayerId;                             // NEW: creator/host
  players: PlayerId[];
  names: Record<PlayerId, string>;
  tokens: Record<PlayerId, string>;
  disconnectTimers: Record<PlayerId, NodeJS.Timeout | null>;
  waitingTimer?: NodeJS.Timeout | null;
  expiresAt?: number;                           // NEW: room expiry
  startedAt?: number;

  // Toss
  callerId?: PlayerId;
  tossCall?: TossCall;
  tossOutcome?: TossCall;
  tossWinnerId?: PlayerId;
  callTimer?: NodeJS.Timeout | null;
  choiceTimer?: NodeJS.Timeout | null;

  // Game
  game: GameState | null;
  round: RoundState | null;
};

const userIdMap = new Map<PlayerId, string | null>();

const app = express();
const httpServer = createServer(app);

/** Express CORS */
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

/** Socket.IO */
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

/** DB */
dbConnect()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

/** ---- In-memory state ---- */
const queue: PlayerId[] = []; // quick match queue (socket ids)
const rooms = new Map<string, RoomState>(); // roomId -> state
const nameMap = new Map<PlayerId, string>(); // socketId -> name
const socketToRoom = new Map<PlayerId, string>(); // socketId -> roomId

/** ---- Helpers ---- */
const pickRandom = <T,>(arr: T[]): T => arr[crypto.randomInt(0, arr.length)];
const randMove = () => crypto.randomInt(1, 7); // 1..6

function clearTimer(t?: NodeJS.Timeout | null) {
  if (t) clearTimeout(t);
}

function safeEmit(target: PlayerId | PlayerId[], event: string, payload: any) {
  if (Array.isArray(target)) {
    target.forEach((id) => io.to(id).emit(event, payload));
  } else {
    io.to(target).emit(event, payload);
  }
}

function peerOf(room: RoomState, sid: PlayerId) {
  return room.players.find((p) => p !== sid)!;
}

function codeIsValid(code: string) {
  return /^[A-Z0-9]{4,8}$/.test(code);
}
function codeRoomExists(code: string) {
  return codeToRoomId.has(code);
}

function cleanupRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  clearTimer(room.callTimer);
  clearTimer(room.choiceTimer);
  if (room.round?.timer) clearTimer(room.round.timer);
  if (room.waitingTimer) clearTimer(room.waitingTimer);

  room.players.forEach((sid) => {
    socketToRoom.delete(sid);
    if (room.disconnectTimers?.[sid]) clearTimer(room.disconnectTimers[sid]);
  });

  if (room.code) codeToRoomId.delete(room.code); // ensure mapping is cleaned

  rooms.delete(roomId);
}

/** ========= Quick-match pairing (unchanged: still auto-toss) ========= */
function tryMatch() {
  while (queue.length >= 2) {
    const a = queue.shift()!;
    const b = queue.shift()!;
    const roomId = `room-${crypto.randomUUID()}`;

    const state: RoomState = {
      id: roomId,
      hostId: a, // arbitrary; quick match has no lobby
      players: [a, b],
      names: {
        [a]: nameMap.get(a) || `Player-${a.slice(0, 4)}`,
        [b]: nameMap.get(b) || `Player-${b.slice(0, 4)}`,
      },
      tokens: { [a]: crypto.randomUUID(), [b]: crypto.randomUUID() },
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

    // send private resume tokens
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

/** ================= Toss flow ================= */
function startToss(room: RoomState) {
  io.to(room.id).emit("toss:start", {
    roomId: room.id,
    callerId: room.callerId,
    timeoutMs: TOSS_CALL_TIMEOUT_MS,
  });

  room.callTimer = setTimeout(() => {
    if (!room.tossCall) {
      room.tossCall = pickRandom<TossCall>(["heads", "tails"]);
      resolveToss(room);
    }
  }, TOSS_CALL_TIMEOUT_MS);
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

  setTimeout(() => {
    room.choiceTimer = setTimeout(() => {
      finalizeChoice(room, pickRandom<BatOrBowl>(["bat", "bowl"]));
    }, CHOICE_TIMEOUT_MS);

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

  room.startedAt = Date.now();
  room.round = null;

  io.to(room.id).emit("toss:final", {
    roomId: room.id,
    winnerId: room.tossWinnerId,
    choice,
    battingId,
    bowlingId,
  });

  startRound(room);
}

/** ================= Round / Move loop ================= */
function startRound(room: RoomState) {
  if (!room.game || room.game.gameOver) return;

  const roundNo = (room.round?.roundNo || 0) + 1;
  const deadlineAt = Date.now() + ROUND_TIMEOUT_MS;
  const moves: Record<PlayerId, number | null> = {
    [room.game.battingId]: null,
    [room.game.bowlingId]: null,
  };

  if (room.round?.timer) clearTimer(room.round.timer);

  room.round = {
    roundNo,
    deadlineAt,
    timer: setTimeout(() => finalizeRound(room, "timeout"), ROUND_TIMEOUT_MS),
    moves,
  };

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

  // fill missing picks
  (Object.keys(r.moves) as PlayerId[]).forEach((pid) => {
    if (r.moves[pid] == null) r.moves[pid] = randMove();
  });

  const battingId = g.battingId;
  const bowlingId = g.bowlingId;
  const batMove = r.moves[battingId]!;
  const bowlMove = r.moves[bowlingId]!;

  type Outcome =
    | { type: "runs"; runsAdded: number }
    | { type: "wicketFirstInnings" }
    | { type: "wicketSecondInnings"; winnerId: PlayerId | null }
    | { type: "chaseComplete"; winnerId: PlayerId }
    | { type: "inningsSwitch" };

  let outcome: Outcome;

  if (g.inning === 1) {
    if (batMove === bowlMove) {
      g.firstInningScore = g.scores[battingId];
      g.inning = 2;
      g.secondInningStarted = true;
      g.target = (g.firstInningScore ?? 0) + 1;

      // swap roles
      const newBatting = bowlingId;
      const newBowling = battingId;
      g.battingId = newBatting;
      g.bowlingId = newBowling;

      outcome = { type: "wicketFirstInnings" };
    } else {
      g.scores[battingId] += batMove;
      outcome = { type: "runs", runsAdded: batMove };
    }
  } else {
    // inning 2 chase
    if (batMove === bowlMove) {
      const chasingScore = g.scores[battingId];
      const target = g.target ?? Number.MAX_SAFE_INTEGER;
      if (chasingScore >= target) {
        g.gameOver = true;
        g.winnerId = battingId;
        outcome = { type: "wicketSecondInnings", winnerId: battingId };
      } else {
        g.gameOver = true;
        g.winnerId = bowlingId;
        outcome = { type: "wicketSecondInnings", winnerId: bowlingId };
      }
    } else {
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

  if (!g.gameOver) {
    setTimeout(() => startRound(room), CLIENT_ANIMATION_MS + 100);
  } else {
    void persistMatch(room, outcome.type);
    setTimeout(() => cleanupRoom(room.id), 15000);
  }
}

async function persistMatch(room: RoomState, reason: string) {
  try {
    const g = room.game;
    if (!g) return;

    const [A, B] = room.players;
    const aName = room.names[A] || `Player-${A.slice(0, 4)}`;
    const bName = room.names[B] || `Player-${B.slice(0, 4)}`;
    const aScore = g.scores[A] ?? 0;
    const bScore = g.scores[B] ?? 0;

    const aUserId = userIdMap.get(A) || null;
    const bUserId = userIdMap.get(B) || null;

    const winnerId = g.winnerId || null;
    const loserId = winnerId ? (winnerId === A ? B : A) : null;

    const doc = {
      roomId: room.id,
      players: [
        { user: aUserId ? new mongoose.Types.ObjectId(aUserId) : null, username: aName, socketId: A },
        { user: bUserId ? new mongoose.Types.ObjectId(bUserId) : null, username: bName, socketId: B },
      ],
      aScore,
      bScore,
      target: g.target ?? null,
      winner: winnerId
        ? {
            user:
              (winnerId === A ? aUserId : bUserId)
                ? new mongoose.Types.ObjectId(winnerId === A ? aUserId! : bUserId!)
                : null,
            username: winnerId === A ? aName : bName,
          }
        : { user: null, username: "" },
      loser: loserId
        ? {
            user:
              (loserId === A ? aUserId : bUserId)
                ? new mongoose.Types.ObjectId(loserId === A ? aUserId! : bUserId!)
                : null,
            username: loserId === A ? aName : bName,
          }
        : { user: null, username: "" },
      reason,
      firstInningScore: g.firstInningScore ?? null,
      startedAt: room.startedAt ? new Date(room.startedAt) : new Date(),
      endedAt: new Date(),
    };

    await Match.create(doc);

    const bumpUser = async (idStr: string | null, isWinner: boolean, score: number) => {
      if (!idStr) return;
      const _id = new mongoose.Types.ObjectId(idStr);

      await User.updateOne(
        { _id },
        {
          $inc: { wins: isWinner ? 1 : 0, losses: isWinner ? 0 : 1 },
          $max: { highScore: score },
        }
      );

      const u = await User.findById(_id).select("wins losses");
      if (u) {
        const total = (u.wins || 0) + (u.losses || 0);
        const pct = total > 0 ? Math.round(((u.wins || 0) / total) * 100) : 0;
        await User.updateOne({ _id }, { $set: { winPercentage: pct } });
      }
    };

    await Promise.all([
      bumpUser(aUserId, winnerId === A, aScore),
      bumpUser(bUserId, winnerId === B, bScore),
    ]);
  } catch (err) {
    console.error("Persist match failed:", err);
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

/** ================= Socket handlers ================= */
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  /** ---- Names / Identity ---- */
  socket.on("me:setName", (name: string) => {
    const trimmed = (name || "").toString().trim();
    nameMap.set(socket.id, trimmed || `Player-${socket.id.slice(0, 4)}`);
  });

  socket.on("me:setUser", async (p: { userId?: string; name?: string }) => {
    try {
      const id = (p.userId || "").toString();
      if (id && mongoose.isValidObjectId(id)) {
        const u = await User.findById(id).select("_id username");
        if (u) {
          userIdMap.set(socket.id, u._id.toString());
          nameMap.set(socket.id, p.name || u.username || `Player-${socket.id.slice(0, 4)}`);
        } else {
          userIdMap.set(socket.id, null);
          if (p.name) nameMap.set(socket.id, p.name);
        }
      } else {
        userIdMap.set(socket.id, null);
        if (p.name) nameMap.set(socket.id, p.name);
      }
    } catch {
      userIdMap.set(socket.id, null);
    }
  });

  /** ---- Quick match queue ---- */
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

  /** ---- Create a private room by code (host) ---- */
  socket.on("room:create", (p: { code: string; name?: string }) => {
    const code = (p.code || "").toUpperCase();
    if (!codeIsValid(code)) {
      safeEmit(socket.id, "room:error", { code, reason: "invalid_code" });
      return;
    }
    if (codeRoomExists(code)) {
      safeEmit(socket.id, "room:exists", { code });
      return;
    }

    const roomId = `code-${crypto.randomUUID()}`;
    const name =
      (p.name || nameMap.get(socket.id) || `Player-${socket.id.slice(0, 4)}`).toString();

    const state: RoomState = {
      id: roomId,
      code,
      hostId: socket.id,
      players: [socket.id],
      names: { [socket.id]: name },
      tokens: { [socket.id]: crypto.randomUUID() },
      disconnectTimers: { [socket.id]: null },
      game: null,
      round: null,
      waitingTimer: null,
      expiresAt: Date.now() + ROOM_WAIT_MS,
    };

    rooms.set(roomId, state);
    codeToRoomId.set(code, roomId);
    socketToRoom.set(socket.id, roomId);
    io.sockets.sockets.get(socket.id)?.join(roomId);
    nameMap.set(socket.id, name);

    // session token for host
    safeEmit(socket.id, "session:token", { roomId, token: state.tokens[socket.id] });

    // waiting window
    state.waitingTimer = setTimeout(() => {
      const r = rooms.get(roomId);
      if (!r) return;
      if (r.players.length < 2 && !r.game) {
        safeEmit(socket.id, "room:timeout", { code, roomId });
        cleanupRoom(roomId);
      }
    }, ROOM_WAIT_MS);

    // notify host about waiting status (with expiry)
    safeEmit(socket.id, "room:waiting", { code, roomId, expiresAt: state.expiresAt });
  });

  /** ---- Join a private room by code (guest) ---- */
  socket.on("room:joinByCode", (p: { code: string; name?: string }) => {
    const code = (p.code || "").toUpperCase();
    if (!codeIsValid(code)) {
      safeEmit(socket.id, "room:error", { code, reason: "invalid_code" });
      return;
    }
    const roomId = codeToRoomId.get(code);
    if (!roomId) {
      safeEmit(socket.id, "room:notFound", { code });
      return;
    }
    const room = rooms.get(roomId);
    if (!room) {
      codeToRoomId.delete(code);
      safeEmit(socket.id, "room:notFound", { code });
      return;
    }

    // expired while waiting?
    if (room.expiresAt && Date.now() > room.expiresAt && !room.game && room.players.length < 2) {
      safeEmit(socket.id, "room:timeout", { code, roomId });
      const host = room.hostId;
      safeEmit(host, "room:timeout", { code, roomId });
      cleanupRoom(roomId);
      return;
    }

    if (room.players.includes(socket.id)) {
      safeEmit(socket.id, "room:alreadyIn", { code, roomId });
      return;
    }
    if (room.players.length >= 2) {
      safeEmit(socket.id, "room:full", { code });
      return;
    }

    const name =
      (p.name || nameMap.get(socket.id) || `Player-${socket.id.slice(0, 4)}`).toString();

    room.players.push(socket.id);
    room.names[socket.id] = name;
    room.tokens[socket.id] = crypto.randomUUID();
    room.disconnectTimers[socket.id] = null;

    nameMap.set(socket.id, name);
    socketToRoom.set(socket.id, roomId);
    io.sockets.sockets.get(socket.id)?.join(roomId);

    // resume token for guest
    safeEmit(socket.id, "session:token", { roomId, token: room.tokens[socket.id] });

    // clear waiting timer now that room is filled
    if (room.waitingTimer) clearTimer(room.waitingTimer);
    room.waitingTimer = null;

    // Tell both players the lobby is READY; do NOT auto-start toss
    io.to(room.id).emit("room:ready", {
      roomId: room.id,
      code: room.code,
      players: room.players.map((id) => ({ id, name: room.names[id] })) as PlayerInfo[],
      hostId: room.hostId,
      expiresAt: room.expiresAt, // can still show in UI
    });
  });

  /** ---- Start game (host or allow either—here host only) ---- */
  socket.on("room:startGame", (p: { roomId: string }) => {
    const room = rooms.get(p.roomId);
    if (!room) return;

    const isMember = room.players.includes(socket.id);
    if (!isMember) return;

    // restrict to host
    if (socket.id !== room.hostId) {
      safeEmit(socket.id, "room:error", { reason: "not_host" });
      return;
    }

    // must have 2 players and not already started
    if (room.players.length !== 2 || room.game || room.tossOutcome || room.tossCall) {
      return;
    }

    // choose caller and start toss
    room.callerId = pickRandom(room.players);

    io.to(room.id).emit("match:found", {
      roomId: room.id,
      players: room.players.map((id) => ({ id, name: room.names[id] })) as PlayerInfo[],
      callerId: room.callerId,
      code: room.code,
    });

    startToss(room);
  });

  /** ---- Leave a private room before game starts ---- */
  socket.on("room:leave", (p: { roomId?: string; code?: string }) => {
    const roomId = p.roomId || (p.code ? codeToRoomId.get((p.code || "").toUpperCase()) : undefined);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const idx = room.players.indexOf(socket.id);
    if (idx >= 0) room.players.splice(idx, 1);
    delete room.names[socket.id];
    delete room.tokens[socket.id];
    socketToRoom.delete(socket.id);
    io.sockets.sockets.get(socket.id)?.leave(room.id);

    // If pre-game and <2 players, notify and cleanup
    if (!room.game) {
      room.players.forEach((peer) => safeEmit(peer, "room:hostLeft", { roomId, code: room.code || null }));
      cleanupRoom(roomId);
    }
  });

  /** ---- Toss events ---- */
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

  /** ---- Real-time moves ---- */
  socket.on("move:select", (p: { roomId: string; move: number }) => {
    const room = rooms.get(p.roomId);
    if (!room || !room.game || !room.round) return;

    const r = room.round;
    if (Date.now() > r.deadlineAt) return;
    const isPlayer = room.players.includes(socket.id);
    if (!isPlayer) return;
    if (p.move < 1 || p.move > 6) return;
    if (r.moves[socket.id] != null) return; // first pick counts

    r.moves[socket.id] = p.move;

    const bothPicked = Object.values(r.moves).every((m) => m != null);
    if (bothPicked) finalizeRound(room, "bothSelected");
  });

  /** ---- Resume support ---- */
  socket.on("resume:join", (p: { roomId: string; token: string; name?: string }) => {
    const room = rooms.get(p.roomId);
    if (!room) return;

    const match = Object.entries(room.tokens).find(([, tok]) => tok === p.token);
    if (!match) {
      safeEmit(socket.id, "resume:failed", { reason: "invalid_token_or_room" });
      return;
    }
    const [oldPlayerId] = match;

    const oldSock = io.sockets.sockets.get(oldPlayerId);
    if (oldSock) {
      try {
        oldSock.leave(room.id);
        safeEmit(oldPlayerId, "session:replaced", { roomId: room.id });
      } catch {}
    }

    const newName =
      (p.name || room.names[oldPlayerId] || `Player-${socket.id.slice(0, 4)}`).toString();
    nameMap.set(socket.id, newName);
    room.names[socket.id] = newName;

    socketToRoom.delete(oldPlayerId);
    socketToRoom.set(socket.id, room.id);

    const idx = room.players.indexOf(oldPlayerId);
    if (idx >= 0) room.players[idx] = socket.id;

    room.tokens[socket.id] = room.tokens[oldPlayerId];
    delete room.tokens[oldPlayerId];

    if (room.game) {
      const g = room.game;
      if (g.battingId === oldPlayerId) g.battingId = socket.id;
      if (g.bowlingId === oldPlayerId) g.bowlingId = socket.id;
      g.scores[socket.id] = g.scores[oldPlayerId] ?? 0;
      delete g.scores[oldPlayerId];
    }
    if (room.round) {
      const r = room.round;
      r.moves[socket.id] = r.moves[oldPlayerId] ?? null;
      delete r.moves[oldPlayerId];
    }

    io.sockets.sockets.get(socket.id)?.join(room.id);
    if (room.disconnectTimers[oldPlayerId]) clearTimer(room.disconnectTimers[oldPlayerId]);
    room.disconnectTimers[socket.id] = null;
    delete room.disconnectTimers[oldPlayerId];

    const snapshot = packSnapshot(room);
    if (snapshot) {
      safeEmit(socket.id, "state:snapshot", {
        roomId: room.id,
        snapshot,
        round: room.round
          ? { round: room.round.roundNo, deadlineAt: room.round.deadlineAt }
          : null,
      });
    } else {
      // Pre-game phases for room screen UX
      let phase:
        | "waitingForOpponent"
        | "waitingForStart"
        | "awaitingTossCall"
        | "resolvingToss"
        | "awaitingChoice" = "waitingForStart";

      if (room.players.length < 2) phase = "waitingForOpponent";
      else if (!room.tossCall && !room.tossOutcome && !room.tossWinnerId) phase = "waitingForStart";
      else if (!room.tossOutcome && !room.tossWinnerId) phase = "awaitingTossCall";
      else if (room.tossOutcome && !room.tossWinnerId) phase = "resolvingToss";
      else if (room.tossWinnerId && !room.game) phase = "awaitingChoice";

      safeEmit(socket.id, "state:pregame", {
        roomId: room.id,
        phase,
        callerId: room.callerId ?? null,
        tossCall: room.tossCall ?? null,
        tossOutcome: room.tossOutcome ?? null,
        winnerId: room.tossWinnerId ?? null,
        hostId: room.hostId,
        code: room.code ?? null,
        expiresAt: room.expiresAt ?? null,
      });
    }

    safeEmit(socket.id, "resume:ok", { roomId: room.id, name: newName });
  });

  /** ---- Disconnect handling ---- */
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const i = queue.indexOf(socket.id);
    if (i >= 0) queue.splice(i, 1);

    const roomId = socketToRoom.get(socket.id);
    if (!roomId) {
      nameMap.delete(socket.id);
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      nameMap.delete(socket.id);
      return;
    }

    // Grace period; if not resumed -> walkover
    room.disconnectTimers[socket.id] = setTimeout(() => {
      const peer = peerOf(room, socket.id);
      safeEmit(peer, "opponent:left", { roomId });

      if (room.game && !room.game.gameOver) {
        room.game.gameOver = true;
        room.game.winnerId = peer;
        io.to(room.id).emit("game:walkover", {
          roomId,
          winnerId: peer,
          snapshot: packSnapshot(room),
        });
      }
      void persistMatch(room, "walkover");
      cleanupRoom(roomId);
    }, DISCONNECT_GRACE_MS);

    nameMap.delete(socket.id);
  });
});

io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});