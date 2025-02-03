require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Score = require("./models/Score"); // Import Score Model
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const authRoutes = require("./routes/auth");
const leaderboardRoutes = require("./routes/leaderboard");

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Game Server is Running...");
});

app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);

// 🏏 Matchmaking System
const users = {};  // { socketId: { username, status: "idle" | "playing", opponent: socketId } }

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("findMatch", (data) => {
    users[socket.id] = { username: data.username, status: "idle", opponent: null };

    const opponentId = Object.keys(users).find(
      (id) => users[id].status === "idle" && id !== socket.id
    );

    if (opponentId) {
      // ✅ Randomly assign one player as "batting" and the other as "bowling"
      const battingPlayer = Math.random() < 0.5 ? socket.id : opponentId;
      const bowlingPlayer = battingPlayer === socket.id ? opponentId : socket.id;

      users[battingPlayer].status = "playing";
      users[bowlingPlayer].status = "playing";
      users[battingPlayer].opponent = bowlingPlayer;
      users[bowlingPlayer].opponent = battingPlayer;

      io.to(battingPlayer).emit("matchFound", { opponent: users[bowlingPlayer].username, role: "batting", startGame: true });
      io.to(bowlingPlayer).emit("matchFound", { opponent: users[battingPlayer].username, role: "bowling", startGame: true });

      console.log(`✅ Match Started: ${users[battingPlayer].username} (Batting) vs ${users[bowlingPlayer].username} (Bowling)`);
    } else {
      setTimeout(() => {
        if (users[socket.id]?.status === "idle") {
          io.to(socket.id).emit("noMatchFound");
          delete users[socket.id];
        }
      }, 20000);
    }
  });

  socket.on("playerMove", (data) => {
    const opponentId = users[socket.id]?.opponent;
    if (opponentId) {
      io.to(opponentId).emit("opponentMove", data.move);
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

  socket.on("gameOver", async (data) => {
    try {
      const user = await User.findOne({ username: data.username });
  
      if (user) {
        console.log(data);

        await Score.create({ userId: user._id, score: data.userScore });
  
        if (data.userScore > user.highScore) {
          user.highScore = data.userScore;
        }
  
        if (data.userScore > data.opponentScore) {
          user.wins += 1;
        } else if (data.userScore < data.opponentScore) {
          user.losses += 1;
        }
  
        const totalGames = user.wins + user.losses;
        user.winPercentage = totalGames > 0 ? (user.wins / totalGames) * 100 : 0;
  
        console.log(user);
        await user.save();
      }
  
      // ✅ Mark player as idle after game ends
      if (users[socket.id]) {
        users[socket.id].status = "idle";
        users[socket.id].opponent = null;
      }
    } catch (error) {
      console.error("❌ Error storing score:", error);
    }
  });
})
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));