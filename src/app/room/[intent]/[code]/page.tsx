export const revalidate = 0;             // ✅ server-only
export const dynamic = "force-dynamic";  // optional, but common for sockets

import RoomRouteClient from "./room-route-client";

type Params = { intent: "create" | "join"; code: string };

export default function RoomPage({ params }: { params: Params }) {
  const { intent, code } = params;
  return <RoomRouteClient intent={intent} code={code} />;
}