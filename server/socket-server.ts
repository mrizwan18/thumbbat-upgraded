import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { handleGameRoutes } from "./routes/gameRoutes";
import { handleMatchmakingRoutes } from "./routes/matchmakingRoutes";
import dbConnect from "./config/db";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

const app = express();
const httpServer = createServer(app);

// Configure CORS for Express
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

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

// Store connected users and their states
const users: {
  [key: string]: {
    username: string;
    status: "idle" | "playing";
    opponent: string | null;
  };
} = {};

// Connect to MongoDB
dbConnect()
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  handleGameRoutes(io, socket, users);
  handleMatchmakingRoutes(io, socket, users);
});

// Add error handler for WebSocket
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});
