# THUMBBAT — Game States

Two state machines exist today and must be kept conceptually distinct in this documentation, because they don't fully agree with each other: the **server's** authoritative room state (`RoomState` in `server/socket-server.ts`), and the **web client's** derived state (scattered across `useGameSocket.ts`'s many `useState` calls — there is no single enum in the current code, only a set of booleans/strings that combine to imply a state). A prior pass of this same project (see `components/game-client/state/deriveGameClientState.ts`, part of the now-superseded React rebuild attempt) already did the work of collapsing the client's booleans into one named enum; that enum is reused here as the vocabulary for this document and is a reasonable starting point for Unity's own state machine, not a locked-in requirement.

---

## EXISTING BEHAVIOR — Server-side room states (`RoomState`, socket-server.ts)

The server does not use a named enum either — state is implied by which fields are populated. Reconstructed here:

| Implied state | How to detect it | Notes |
|---|---|---|
| `WAITING_FOR_SECOND_PLAYER` | `room.players.length === 1`, `room.game === null` | Only reachable via private room creation (`room:create`); quick match never has this state since `tryMatch()` only creates a room once two are queued |
| `LOBBY_READY` | `room.players.length === 2`, `room.game === null`, no toss fields set | Private room only, and only if the host hasn't called `room:startGame` yet |
| `TOSS_IN_PROGRESS` | `room.tossCall`/`room.tossOutcome`/`room.tossWinnerId` populated in sequence, `room.game === null` | Quick match skips `LOBBY_READY` and enters this immediately on match |
| `IN_GAME` | `room.game !== null && !room.game.gameOver` | |
| `GAME_OVER` | `room.game.gameOver === true` | Room is kept alive for 15s after game-over (`cleanupRoom` scheduled), then deleted |
| `DISCONNECT_GRACE` | not a distinct field — a `room.disconnectTimers[socketId]` is active | Overlaps with any of the above; see "Disconnect/walkover" below |

## EXISTING BEHAVIOR — Client-derived states (web app)

The following ten states were named and derived (not invented) from the existing `useGameSocket()`/`useBotGame()` boolean/string outputs during the prior React-rebuild attempt. They are a faithful relabeling of existing behavior:

| State | Derived from (exact fields) |
|---|---|
| `boot` | Not part of `useGameSocket` at all — owned by the `/` route's cinematic-video sequence, outside this hook entirely |
| `auth` | Same — outside `useGameSocket`, gated by `useAuthGuard`/`src/middleware.ts` |
| `home` | `!preGameInRoom && !gameStarted && !isBotMode && !searching && tossPhase === "idle"` |
| `matchmaking` | `searching === true` |
| `private_lobby` | `preGameInRoom === true` (a room exists, pre-toss) |
| `match_intro` | `tossPhase !== "idle" && tossPhase !== "done" && !gameStarted` (multiplayer) **or** `isBotMode && showGameStartPopup` (bot — see below, not the same mechanism) |
| `gameplay` | `gameStarted \|\| isBotMode` (and game not over) |
| `result` | `isGameOver \|\| botGameOver` |
| `leaderboard` | Not derived from `useGameSocket` at all — a separate page/route (`/leaderboard`) in the current app, not a "state" in the socket sense |
| `profile_settings` | Doesn't exist in the current product at all — no settings feature exists anywhere in this codebase (confirmed by repo-wide search in an earlier phase of this project) |

## EXISTING BEHAVIOR — Bot mode's "match intro" is not the same mechanism as multiplayer's toss

Multiplayer match-intro is the full toss flow above (call, outcome, choose bat/bowl — three separate real decisions, two of which are timed). Bot mode has none of that: `startBotGame()` picks batting/bowling **uniformly at random** (`Math.random() < 0.5`) with no toss ceremony at all, and shows a `showGameStartPopup` overlay for a **fixed, non-interactive 1400ms** before gameplay begins. These are different mechanics wearing the same "match intro" label — a Unity implementation needs to decide (see `OPEN_QUESTIONS.md`) whether bot mode gets a real toss for consistency, or keeps this simpler flow.

## EXISTING BEHAVIOR — Disconnect / walkover state

Not represented in either state list above because it's an *overlay* on top of whichever state was active, not a distinct one:

1. `socket.on("disconnect")` fires (tab closed, network drop, etc.).
2. Server starts a `DISCONNECT_GRACE_MS` (20,000 ms) timer for that room.
3. If the same client reconnects and emits `resume:join` with the room's token before the timer fires, the grace period is cancelled and the disconnected player's socket ID is fully swapped for the new one (see `NETWORK_PROTOCOL.md` for the resume payload) — game continues uninterrupted.
4. If the timer fires first, the remaining player is declared the winner (`game:walkover`), the match is persisted with `reason: "walkover"`, and the room is cleaned up.

## EXISTING BEHAVIOR — The resume/reconnect capability is server-only today

`resume:join`, `resume:ok`, `resume:failed`, `session:replaced`, `state:snapshot`, and `state:pregame` are all real, implemented server events (see `NETWORK_PROTOCOL.md`). **The existing web client never emits `resume:join`** — `useGameSocket.ts` has no code path that does so, even though `session:token` (needed to resume) is received and stored in `localStorage` on every match/room start. A page refresh mid-game today just silently orphans the old socket until the 20s grace timer walkovers it — the reconnect capability is fully built server-side and completely unused client-side.

This is directly relevant to Unity: reconnect-on-relaunch (e.g., after an Android app backgrounding/OS kill) is a natural mobile requirement, and the server already supports exactly this — Unity would be the *first* client to actually use it, not inventing a new capability.

## EXISTING BEHAVIOR — No client-side "return to Home" for multiplayer

Confirmed during the prior React-rebuild attempt and restated here as a hard fact about the current backend/hook contract: `useGameSocket()` exposes no function to cleanly leave a room or reset match state back to an idle/home condition. The existing web app's only "go home after a multiplayer match" mechanism is a **full page reload** (`window.location.href = "/"`), which works for a browser but has no equivalent in a persistent Unity app process. This is a real gap Unity's networking layer will need to either work around (e.g., always reconnect fresh, accepting a new socket ID) or request a fix for (a real `room:leave`/reset capability the server already has server-side logic for — `room:leave` exists as an event, but only handles the *pre-game* leave case; there's no equivalent for leaving a finished or in-progress game cleanly).

## OPEN QUESTION

- Should the Unity port implement the resume/reconnect flow that already exists server-side but is unused? This seems like an obvious win for mobile (app backgrounding is far more common than on desktop web) but is flagged rather than assumed, since it's new client behavior even though it uses an existing server contract.
- Should bot mode gain a real toss ceremony for visual/mechanical consistency with multiplayer, or is the fast, toss-less bot start intentional (keeps practice mode quick)?
- Is there a plan to add a proper "leave/forfeit" capability server-side, or should Unity design around the current reload-only behavior indefinitely?
