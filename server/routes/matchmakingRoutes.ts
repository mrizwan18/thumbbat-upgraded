import { Server, Socket } from "socket.io";

interface UserState {
  username: string;
  status: "idle" | "playing";
  opponent: string | null;
}

export const handleMatchmakingRoutes = (
  io: Server,
  socket: Socket,
  users: { [key: string]: UserState }
) => {
  socket.on("findMatch", (data: { username: string }) => {
    users[socket.id] = {
      username: data.username,
      status: "idle",
      opponent: null,
    };
    const opponentId = Object.keys(users).find(
      (id) => users[id].status === "idle" && id !== socket.id
    );

    if (opponentId) {
      // Randomly assign one player as "batting" and the other as "bowling"
      const battingPlayer = Math.random() < 0.5 ? socket.id : opponentId;
      const bowlingPlayer =
        battingPlayer === socket.id ? opponentId : socket.id;

      users[battingPlayer].status = "playing";
      users[bowlingPlayer].status = "playing";
      users[battingPlayer].opponent = bowlingPlayer;
      users[bowlingPlayer].opponent = battingPlayer;

      io.to(battingPlayer).emit("matchFound", {
        opponent: users[bowlingPlayer].username,
        role: "batting",
        startGame: true,
      });
      io.to(bowlingPlayer).emit("matchFound", {
        opponent: users[battingPlayer].username,
        role: "bowling",
        startGame: true,
      });

      console.log(
        `✅ Match Started: ${users[battingPlayer].username} (Batting) vs ${users[bowlingPlayer].username} (Bowling)`
      );
    } else {
      // If no opponent is found, wait for 20 seconds before timing out
      setTimeout(() => {
        if (users[socket.id]?.status === "idle") {
          io.to(socket.id).emit("noMatchFound");
          delete users[socket.id];
        }
      }, 20000);
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      const opponentId = users[socket.id].opponent;
      if (opponentId) {
        io.to(opponentId).emit("opponentDisconnected");
        users[opponentId].status = "idle";
        users[opponentId].opponent = null;
      }
      delete users[socket.id];
    }
  });
};
