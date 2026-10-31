import { io, Socket } from "socket.io-client";

let _socket: Socket | null = null;

export function getSocket() {
  if (!_socket) {
    _socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      transports: ["websocket"],
    });

    // Add connection event listeners for better debugging and resilience
    _socket.on("connect", () => {
      console.log("Socket connected successfully.");
    });

    _socket.on("disconnect", (reason: string) => {
      console.warn(`Socket disconnected. Reason: ${reason}`);
    });

    _socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error.message);
    });
  }
  return _socket;
}
