import { createServer } from "http";
import express from "express";
import { Server, Socket } from "socket.io";
import crypto from "crypto";

type Player = {
  id: string;
  name: string;
  roomId?: string;
};

type RoomState = {
  id: string;
  players: string[]; // socket ids
  callerId?: string; // who calls heads/tails
  tossCall?: "heads" | "tails";
  tossOutcome?: "heads" | "tails";
  tossWinnerId?: string;
  choiceTimer?: NodeJS.Timeout;
  callTimer?: NodeJS.Timeout;
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const queue: Player[] = [];
const rooms = new Map<string, RoomState>();

const pickRandom = <T,>(arr: T[]): T => arr[crypto.randomInt(0, arr.length)];

const autoAfter = (ms: number, fn: () => void) => {
  const t = setTimeout(fn, ms);
  return t;
};

io.on("connection", (socket: Socket) => {
  const me: Player = { id: socket.id, name: `Player-${socket.id.slice(0, 4)}` };

  socket.on("me:setName", (name: string) => {
    me.name = name || me.name;
  });

  socket.on("queue:join", () => {
    // basic de-dupe
    if (!queue.find(p => p.id === me.id)) queue.push(me);
    tryMatch();
  });

  socket.on("disconnect", () => {
    // remove from queue
    const i = queue.findIndex(p => p.id === me.id);
    if (i >= 0) queue.splice(i, 1);

    // inform room peer
    const room = [...rooms.values()].find(r => r.players.includes(me.id));
    if (room) {
      io.to(room.id).emit("opponent:left");
      rooms.delete(room.id);
    }
  });

  // Caller picks heads/tails
  socket.on("toss:call", ({ roomId, call }: { roomId: string; call: "heads" | "tails" }) => {
    const room = rooms.get(roomId);
    if (!room || room.callerId !== socket.id) return;

    if (!room.tossCall) {
      room.tossCall = call;
      resolveToss(room);
    }
  });

  // Winner chooses bat/bowl
  socket.on("toss:choose", ({ roomId, choice }: { roomId: string; choice: "bat" | "bowl" }) => {
    const room = rooms.get(roomId);
    if (!room || room.tossWinnerId !== socket.id) return;
    finalizeChoice(room, choice);
  });

  function tryMatch() {
    if (queue.length >= 2) {
      const a = queue.shift()!;
      const b = queue.shift()!;
      const roomId = `room-${crypto.randomUUID()}`;
      const state: RoomState = { id: roomId, players: [a.id, b.id] };
      rooms.set(roomId, state);

      io.sockets.sockets.get(a.id)?.join(roomId);
      io.sockets.sockets.get(b.id)?.join(roomId);

      // choose caller randomly
      state.callerId = pickRandom(state.players);

      io.to(roomId).emit("match:found", {
        roomId,
        players: [
          { id: a.id, name: a.name },
          { id: b.id, name: b.name },
        ],
        callerId: state.callerId,
      });

      startToss(state);
    }
  }

  function startToss(room: RoomState) {
    // give caller 5s to call; else auto-pick
    io.to(room.id).emit("toss:start", { roomId: room.id, callerId: room.callerId, timeoutMs: 5000 });

    room.callTimer = autoAfter(5000, () => {
      if (!room.tossCall) {
        room.tossCall = pickRandom<"heads" | "tails">(["heads", "tails"]);
        resolveToss(room);
      }
    });
  }

  function resolveToss(room: RoomState) {
    if (room.callTimer) clearTimeout(room.callTimer);

    const outcome = pickRandom<"heads" | "tails">(["heads", "tails"]);
    room.tossOutcome = outcome;

    const winnerIsCaller = room.tossCall === outcome;
    const winnerId = winnerIsCaller ? room.callerId! : room.players.find(id => id !== room.callerId)!;
    room.tossWinnerId = winnerId;

    io.to(room.id).emit("toss:result", {
      roomId: room.id,
      call: room.tossCall,
      outcome,
      winnerId,
    });

    // winner gets 5s to choose, else auto
    room.choiceTimer = autoAfter(5000, () => {
      finalizeChoice(room, pickRandom<"bat" | "bowl">(["bat", "bowl"]));
    });

    io.to(winnerId).emit("toss:yourTurnToChoose", { roomId: room.id, timeoutMs: 5000 });
    const other = room.players.find(id => id !== winnerId)!;
    io.to(other).emit("toss:opponentChoosing", { roomId: room.id, timeoutMs: 5000 });
  }

  function finalizeChoice(room: RoomState, choice: "bat" | "bowl") {
    if (room.choiceTimer) clearTimeout(room.choiceTimer);

    const battingId = choice === "bat" ? room.tossWinnerId! : room.players.find(id => id !== room.tossWinnerId)!;
    const bowlingId = room.players.find(id => id !== battingId)!;

    io.to(room.id).emit("toss:final", {
      roomId: room.id,
      winnerId: room.tossWinnerId,
      choice,          // what winner chose
      battingId,
      bowlingId,
    });

    // (keep room for gameplay; cleanup on game end or disconnect)
  }
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Socket.IO server on :${PORT}`));