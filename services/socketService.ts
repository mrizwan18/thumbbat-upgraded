import { io, Socket } from "socket.io-client";
import { env } from "../src/env";

interface User {
  username: string;
  status: "idle" | "playing";
  opponent: string | null;
}

interface GameState {
  users: { [socketId: string]: User };
}

interface MatchFoundData {
  opponent: string;
  role: "batting" | "bowling";
  startGame: boolean;
}

interface GameOverData {
  username: string;
  userScore: number;
  opponentScore: number;
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private gameState: GameState = { users: {} };

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ["polling", "websocket"],
        withCredentials: true,
        forceNew: true,
        reconnectionAttempts: 5,
        timeout: 10000,
      });
      console.log("Socket connecting to:", env.NEXT_PUBLIC_SOCKET_URL);
    }
    return this.socket;
  }

  // Game Actions
  findMatch(username: string) {
    this.socket?.emit("findMatch", { username });
  }

  sendMove(move: number) {
    this.socket?.emit("playerMove", { move });
  }

  gameOver(data: GameOverData) {
    this.socket?.emit("gameOver", data);
  }

  // Event Listeners
  onConnect(callback: () => void) {
    this.socket?.on("connect", callback);
  }

  onDisconnect(callback: () => void) {
    this.socket?.on("disconnect", callback);
  }

  onMatchFound(callback: (data: MatchFoundData) => void) {
    this.socket?.on("matchFound", callback);
  }

  onNoMatchFound(callback: () => void) {
    this.socket?.on("noMatchFound", callback);
  }

  onOpponentMove(callback: (move: number) => void) {
    this.socket?.on("opponentMove", callback);
  }

  onOpponentDisconnected(callback: () => void) {
    this.socket?.on("opponentDisconnected", callback);
  }

  // Cleanup
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Specific event cleanup
  cleanup() {
    if (this.socket) {
      this.socket.off("matchFound");
      this.socket.off("noMatchFound");
      this.socket.off("opponentMove");
      this.socket.off("opponentDisconnected");
    }
  }
}

// Export a singleton instance
export const socketService = SocketService.getInstance();
