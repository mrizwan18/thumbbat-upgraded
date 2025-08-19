export const revalidate = 0;             // server-only
export const dynamic = "force-dynamic";  // optional, good for socket-driven pages

import GameScreenClient from "./GameScreen";

export default function GamePage() {
  return <GameScreenClient />;
}