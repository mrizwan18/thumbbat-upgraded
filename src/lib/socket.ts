import { io, Socket } from "socket.io-client";

let _socket: Socket | null = null;

export function getSocket() {
  if (!_socket) {
    _socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      transports: ["websocket"],
    });
  }
  return _socket;
}