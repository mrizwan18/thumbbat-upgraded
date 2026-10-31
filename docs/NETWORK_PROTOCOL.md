# THUMBBAT — Network Protocol

**Source of truth:** `server/socket-server.ts` (the active server — see the note on `server/index.ts` below) and `src/hooks/useGameSocket.ts` (the only client implementation that exists to cross-check against). Every payload shape below is transcribed directly from these two files, not inferred or guessed.

Transport: Socket.IO 4.8.1, both `polling` and `websocket` enabled server-side, `allowEIO3: true` (Engine.IO v3 compatibility kept on). CORS is fully open (`origin: true`) server-side today.

## EXISTING BEHAVIOR — Two server implementations exist; only one is live

`server/index.ts` is an earlier, much simpler prototype of this same server (no private-room-by-code, no round/move loop at all, no persistence, default port 4000). **It is dead code** — neither `package.json` nor `server/package.json` has any script that runs it (`grep` across both confirms zero references). The only entry point actually run in development or production is `server/socket-server.ts` (`npm run socket-server` → `tsx server/socket-server.ts`; production build via `server/package.json`'s own `tsc` → `node dist/socket-server.js`, default port 5001/`process.env.PORT`). Everything below describes `socket-server.ts` only.

---

## Client → Server events

| Event | Payload | Notes |
|---|---|---|
| `me:setName` | `string` (raw name, not wrapped in an object) | Sent once on connect, and again at the start of `startQuickMatch()` |
| `me:setUser` | `{ userId?: string; name?: string }` | `userId` sourced from `localStorage.getItem("userId")`. Server validates it's a real Mongo ObjectId and a real user before trusting it — if not, `userId` is treated as null server-side, not rejected |
| `queue:join` | *(none)* | De-duped server-side (`if (!queue.includes(socket.id))`) |
| `queue:leave` | *(none)* | |
| `room:create` | `{ code: string; name?: string }` | **`code` is generated client-side** (see below) — the server only validates format (`/^[A-Z0-9]{4,8}$/`) and uniqueness, it does not generate codes |
| `room:joinByCode` | `{ code: string; name?: string }` | |
| `room:startGame` | `{ roomId: string }` | Host-only; server rejects (`room:error`, `reason: "not_host"`) if the caller isn't `room.hostId` |
| `room:leave` | `{ roomId?: string; code?: string }` | **Pre-game only** — server code path only handles `!room.game` (removes the player, notifies the peer via `room:hostLeft`, cleans up). No handling exists for leaving a room that already has an active or finished game |
| `toss:call` | `{ roomId: string; call: "heads" \| "tails" }` | Server ignores if sender isn't `room.callerId`, or if a call was already made |
| `toss:choose` | `{ roomId: string; choice: "bat" \| "bowl" }` | Server ignores if sender isn't `room.tossWinnerId` |
| `move:select` | `{ roomId: string; move: number }` | Server ignores if: room/game/round missing, deadline passed, sender not in room, `move` outside 1–6, or sender already picked this round (**first pick wins** — a second `move:select` in the same round is silently dropped) |
| `resume:join` | `{ roomId: string; token: string; name?: string }` | **Never emitted by the existing web client** — fully real, fully implemented server-side, unused. See below for exact reconnect semantics |

## EXISTING BEHAVIOR — Client-side room-code generation

`useGameSocket.ts`'s `createRoom()`:
```ts
const genCode = (len = 6) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 — ambiguity-reduced
  ...
};
```
The code is generated locally, copied to the clipboard immediately (`navigator.clipboard.writeText`), *then* sent to the server via `room:create`. The server independently re-validates the format but has no code-generation logic of its own — if two clients ever generated the same code simultaneously, the second `room:create` for that code would be rejected via `room:exists`, but nothing server-side actively prevents the race beyond that check-then-set. **A Unity client must either reproduce this exact client-side generation (same alphabet, same length) or the backend needs to move code generation server-side** — flagged explicitly in `OPEN_QUESTIONS.md`, not decided here.

---

## Server → Client events

| Event | Payload | Notes |
|---|---|---|
| `session:token` | `{ roomId: string; token: string }` | Sent on both quick-match and private-room entry. The **only** consumer today writes it to `localStorage` (`mp_roomId`, `mp_token`) and never reads it back — the resume flow this token exists for is unused client-side |
| `match:found` | `{ roomId: string; players: {id,name}[]; callerId: string; code?: string }` | Fired both by quick-match pairing *and* by `room:startGame` (private room) — same event, two different triggers |
| `room:waiting` | `{ code: string; roomId: string; expiresAt: number }` | Host only, private room, pre-second-player |
| `room:ready` | `{ roomId: string; code?: string; players: {id,name}[]; hostId: string; expiresAt?: number \| null }` | Both players, once the second joins. Does **not** imply the toss starts |
| `room:timeout` | `{ code: string; roomId: string }` | Private room expired (5 min) before a second player joined |
| `room:exists` | `{ code: string }` | Attempted to create a code that's already in use |
| `room:notFound` | `{ code: string }` | Attempted to join a code that doesn't exist |
| `room:full` | `{ code: string }` | Attempted to join a room that already has 2 players |
| `room:hostLeft` | `{ roomId: string; code: string \| null }` | Sent to remaining player(s) when someone leaves pre-game |
| `room:alreadyIn` | `{ code: string; roomId: string }` | Same socket (or, for logged-in users, same account across two socket connections) tried to join a room it's already in |
| `room:error` | `{ code?: string; reason: string }` \| `{ reason: string }` | `reason` values observed in source: `"invalid_code"`, `"not_host"` |
| `toss:start` | `{ roomId: string; callerId: string; timeoutMs: number }` | `timeoutMs` is always `TOSS_CALL_TIMEOUT_MS` (15000) today, but the client correctly treats it as server-authoritative, not hardcoded |
| `toss:result` | `{ roomId: string; call: "heads"\|"tails"; outcome: "heads"\|"tails"; winnerId: string }` | |
| `toss:yourTurnToChoose` | `{ roomId: string; timeoutMs: number }` | Sent to the toss winner only |
| `toss:opponentChoosing` | `{ roomId: string; timeoutMs: number }` | Sent to the non-winner only |
| `toss:final` | `{ roomId: string; winnerId: string; choice: "bat"\|"bowl"; battingId: string; bowlingId: string }` | Gameplay begins immediately after this |
| `move:roundStart` | `{ roomId: string; round: number; deadlineAt: number; snapshot: Snapshot }` | `deadlineAt` is an absolute epoch-ms timestamp, not a duration — clients compute their own countdown from it |
| `move:roundResult` | `{ roomId: string; round: number; moves: Record<playerId, number>; outcome: Outcome; applyAfterMs: number; snapshot: Snapshot }` | `applyAfterMs` is always `CLIENT_ANIMATION_MS` (1500) today; `moves` contains **both** players' picks keyed by socket ID, sent to both clients (i.e., you learn the opponent's number the instant the round resolves, not before) |
| `state:snapshot` | `{ roomId: string; snapshot: Snapshot; round: {round,deadlineAt} \| null }` | Reconnect-path payload for mid-game resume. Client has a **partial, seemingly incomplete** handler for this today (reads `snapshot` but the destructuring in `useGameSocket.ts` doesn't match this exact server shape — see `OPEN_QUESTIONS.md`) |
| `state:pregame` | `{ roomId, phase, callerId, tossCall, tossOutcome, winnerId, hostId, code, expiresAt }` — `phase` is one of `"waitingForOpponent" \| "waitingForStart" \| "awaitingTossCall" \| "resolvingToss" \| "awaitingChoice"` | Reconnect-path payload for pre-game resume. **The existing client has no handler for this event at all** — confirmed by grep, zero `s.on("state:pregame"...)` anywhere |
| `resume:ok` | `{ roomId: string; name: string }` | |
| `resume:failed` | `{ reason: string }` | Observed reason: `"invalid_token_or_room"` |
| `session:replaced` | `{ roomId: string }` | Sent to the *old* socket ID when a resume takes over its seat |
| `opponent:left` | `{ roomId: string }` | Sent once, immediately, on disconnect (before the grace timer even starts) — the client already sets `isGameOver`/shows a walkover message on this event **alone**, even though the server hasn't given up on reconnect yet at this point. See `OPEN_QUESTIONS.md` — this looks like a real premature-walkover-display bug in the existing client. |
| `game:walkover` | `{ roomId: string; winnerId: string; snapshot: Snapshot }` | Sent only if the grace period actually expires. By this point the client has already shown the walkover message (see above) |

### `Snapshot` (shared shape, `src/types/realtime.ts`)
```ts
interface Snapshot {
  inning: 1 | 2;
  battingId: string;
  bowlingId: string;
  scores: Record<string, number>;
  firstInningScore: number | null;
  secondInningStarted: boolean;
  target: number | null;
  gameOver: boolean;
  winnerId: string | null;
}
```
**Not duplicated on the server side as a shared type** — `server/socket-server.ts` has its own inline `GameState`/snapshot shape that happens to match. Any future protocol change must be hand-mirrored in both places today; there is no single shared schema file between client and server.

## EXISTING BEHAVIOR — The `opponent:left` premature-signal issue

Worth calling out precisely since it affects Unity's reconnect UX design: the server emits `opponent:left` **the instant** the socket disconnects (before the 20s grace period even begins), purely as an informational "your opponent's connection dropped" signal — but the existing web client's handler for it immediately sets `isGameOver = true` and shows a walkover-style message, which is **not actually true yet** (the opponent has 20 more seconds to reconnect via `resume:join`, which would silently un-walkover them if the client hadn't already jumped to a false "game over" state). This is existing client behavior, not server behavior — the server's real, authoritative walkover only arrives later via `game:walkover`, if it arrives at all.

## OPEN QUESTION

- Should Unity replicate the existing client's premature `opponent:left` → game-over display (bug-for-bug parity) or fix it (only show a "reconnecting…" state on `opponent:left`, and only actually end the match on `game:walkover`)? This is existing *client* behavior, not server behavior, so it's a legitimate thing to improve — but flagged rather than silently changed, per instruction.
- `state:snapshot`'s real payload shape (`{roomId, snapshot, round}`) doesn't match what `useGameSocket.ts`'s handler destructures (`{snapshot}` only, and reads `oppId` from a ref that may not be populated on a fresh reconnect where `opponentIdRef` was never set). Is this a known-broken path that's simply never been exercised because nothing calls `resume:join`, or is there a reason it looks incomplete? Flagging as a real code-inspection finding, not assuming either explanation.
- Should room-code generation move server-side for the Unity port (removing the client-authority-over-identifiers quirk), or should Unity match the existing client-generates-the-code behavior exactly? Both are legitimate; the existing behavior is documented above without a recommendation baked in.
