import { io, Socket } from "socket.io-client";
import { env } from "../src/env";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

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
}

// Export a singleton instance
export const socketService = SocketService.getInstance();
