import { Server, Socket } from "socket.io";
import User from "../models/User";
import Score from "../models/Score";

interface UserState {
  username: string;
  status: "idle" | "playing";
  opponent: string | null;
}

interface GameOverData {
  username: string;
  userScore: number;
  opponentScore: number;
}

export const handleGameRoutes = (
  io: Server,
  socket: Socket,
  users: { [key: string]: UserState }
) => {
  socket.on("playerMove", (data: { move: number }) => {
    const opponentId = users[socket.id]?.opponent;
    if (opponentId) {
      io.to(opponentId).emit("opponentMove", data.move);
    }
  });

  socket.on("gameOver", async (data: GameOverData) => {
    try {
      const user = await User.findOne({ username: data.username });
      if (user) {
        await Score.create({ userId: user._id, score: data.userScore });
        // Rest of your game over logic
        if (data.userScore > user.highScore) {
          user.highScore = data.userScore;
        }

        if (data.userScore > data.opponentScore) {
          user.wins += 1;
        } else if (data.userScore < data.opponentScore) {
          user.losses += 1;
        }

        const totalGames = user.wins + user.losses;
        user.winPercentage =
          totalGames > 0 ? (user.wins / totalGames) * 100 : 0;

        await user.save();
      }
      if (users[socket.id]) {
        users[socket.id].status = "idle";
        users[socket.id].opponent = null;
      }
    } catch (error) {
      console.error("❌ Error storing score:", error);
    }
  });
};
