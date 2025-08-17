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
const TOSS_CALL_TIMEOUT_MS = 15000;
const CHOICE_TIMEOUT_MS = 15000;
const RESULT_REVEAL_MS = 2000; // 2s to show toss result before choice UI

type TossCall = "heads" | "tails";
type BatOrBowl = "bat" | "bowl";

type PlayerInfo = {
  id: string;
  name: string;
};

type RoomState = {
  id: string;
  players: string[]; // socket ids
  names: Record<string, string>; // id -> name
  callerId?: string;
  tossCall?: TossCall;
  tossOutcome?: TossCall;
  tossWinnerId?: string;
  callTimer?: NodeJS.Timeout | null;
  choiceTimer?: NodeJS.Timeout | null;
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

// ---- DB connect (unchanged) ----
dbConnect()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

/** ---- In-memory state ---- */
const queue: string[] = []; // socket ids waiting
const rooms = new Map<string, RoomState>(); // roomId -> state
const nameMap = new Map<string, string>(); // socketId -> name
const socketToRoom = new Map<string, string>(); // socketId -> roomId

/** ---- Helpers ---- */
const pickRandom = <T,>(arr: T[]): T => arr[crypto.randomInt(0, arr.length)];

function startTimer(ms: number, fn: () => void): NodeJS.Timeout {
  return setTimeout(fn, ms);
}

function clearTimer(t?: NodeJS.Timeout | null) {
  if (t) clearTimeout(t);
}

function safeEmit(target: string | string[], event: string, payload: any) {
  if (Array.isArray(target)) {
    target.forEach((id) => io.to(id).emit(event, payload));
  } else {
    io.to(target).emit(event, payload);
  }
}

function getPeer(room: RoomState, sid: string) {
  return room.players.find((p) => p !== sid)!;
}

function cleanupRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  clearTimer(room.callTimer);
  clearTimer(room.choiceTimer);
  room.players.forEach((sid) => socketToRoom.delete(sid));
  rooms.delete(roomId);
}

/** ---- Core matchmaking & toss flow ---- */
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
    };

    rooms.set(roomId, state);
    socketToRoom.set(a, roomId);
    socketToRoom.set(b, roomId);

    io.sockets.sockets.get(a)?.join(roomId);
    io.sockets.sockets.get(b)?.join(roomId);

    // choose caller randomly
    state.callerId = pickRandom([a, b]);

    io.to(roomId).emit("match:found", {
      roomId,
      players: [
        { id: a, name: state.names[a] },
        { id: b, name: state.names[b] },
      ] as PlayerInfo[],
      callerId: state.callerId,
    });

    // begin toss
    startToss(state);
  }
}

function startToss(room: RoomState) {
  // caller has 5s to call
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

  // 1) Broadcast result immediately
  io.to(room.id).emit("toss:result", {
    roomId: room.id,
    call: room.tossCall,
    outcome,
    winnerId,
  });

  // 2) After a reveal delay, show the Bat/Bowl choice UI and start the timer
  setTimeout(() => {
    // start the auto-choose timer now (NOT before)
    room.choiceTimer = startTimer(CHOICE_TIMEOUT_MS, () => {
      finalizeChoice(room, pickRandom<BatOrBowl>(["bat", "bowl"]));
    });

    io.to(winnerId).emit("toss:yourTurnToChoose", {
      roomId: room.id,
      timeoutMs: CHOICE_TIMEOUT_MS,
    });
    io.to(getPeer(room, winnerId)).emit("toss:opponentChoosing", {
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

  io.to(room.id).emit("toss:final", {
    roomId: room.id,
    winnerId: room.tossWinnerId,
    choice, // what winner chose
    battingId,
    bowlingId,
    // NOTE: keep room for gameplay. Cleanup after game end.
  });
}

/** ---- Socket handlers ---- */
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // optional: set a display name
  socket.on("me:setName", (name: string) => {
    const trimmed = (name || "").toString().trim();
    nameMap.set(socket.id, trimmed || `Player-${socket.id.slice(0, 4)}`);
  });

  // enter queue to find a match
  socket.on("queue:join", () => {
    if (!queue.includes(socket.id)) {
      queue.push(socket.id);
      tryMatch();
    }
  });

  // caller picks heads/tails
  socket.on("toss:call", (p: { roomId: string; call: TossCall }) => {
    const room = rooms.get(p.roomId);
    if (!room) return;
    if (room.callerId !== socket.id) return; // only caller may call
    if (room.tossCall) return; // already called

    room.tossCall = p.call;
    resolveToss(room);
  });

  // toss winner picks bat/bowl
  socket.on("toss:choose", (p: { roomId: string; choice: BatOrBowl }) => {
    const room = rooms.get(p.roomId);
    if (!room) return;
    if (room.tossWinnerId !== socket.id) return; // only winner may choose

    finalizeChoice(room, p.choice);
  });

  // optional: allow leaving the queue
  socket.on("queue:leave", () => {
    const i = queue.indexOf(socket.id);
    if (i >= 0) queue.splice(i, 1);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // remove from queue
    const i = queue.indexOf(socket.id);
    if (i >= 0) queue.splice(i, 1);

    // handle room cleanup + inform peer
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const peer = getPeer(room, socket.id);
        safeEmit(peer, "opponent:left", { roomId });
        cleanupRoom(roomId);
      }
    }

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