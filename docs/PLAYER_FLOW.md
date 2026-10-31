# THUMBBAT — Player Flow

The end-to-end journey through the existing web app, in the order a real player experiences it. Each step is marked with its authority (EXISTING BEHAVIOR vs. ASSUMPTION vs. OPEN QUESTION) rather than assumed to be the target Unity flow verbatim — see `VISUAL_DIRECTION.md` for how the *presentation* should differ.

---

## 1. Boot

## EXISTING BEHAVIOR
- Route `/` plays a ~5s cinematic video (`public/media/loader.mp4`, with `public/media/loader-poster.jpg` as the poster/first-frame fallback so there's never a blank screen).
- The video's native `ended` event (not a timer) triggers the next step. Autoplay failures and load errors are both treated identically to a natural `ended` — the cinematic never blocks progress if it can't play.
- While the video plays, the next route (`/game`) is prefetched.

## 2. Authentication

## EXISTING BEHAVIOR
- If a valid session already exists (`token` in `localStorage`), the boot sequence fades and navigates straight to `/game` — no auth UI shown at all.
- If not, a single "Continue with Google" control appears over the frozen final frame of the cinematic. This is real OAuth (Google Identity Services token-client flow), not a placeholder — verified working end-to-end with a real Google account during this project's own build history.
- A secondary username/password flow exists at `/login` (email/password login and signup, with email confirmation via a mailed link) but is **not** part of the primary flow — it's reachable directly by URL for backwards compatibility, not linked from the boot/home experience.
- On successful auth (either method), the server issues a JWT (1-day expiry). It's stored in `localStorage` (`token`, `username`, `userId`) **and** mirrored into a `token` cookie — the cookie, not `localStorage`, is what `src/middleware.ts` actually checks server-side to gate `/game`.

## 3. Home

## EXISTING BEHAVIOR
- `/game`'s idle state. Shows the player's identity (username), a single dominant "PLAY" action, and two subordinate actions: "Private Match" and "Practice".
- "PLAY" maps to quick matchmaking (`startQuickMatch()` → `queue:join`) — there is no separate "choose a mode" step; PLAY *is* quick match.
- A leaderboard is reachable from here (as an overlay in the most recent React-rebuild attempt; as a separate page/route, `/leaderboard`, in the original implementation).
- No settings/profile management screen exists in the current product at all (see `GAME_STATES.md`).

## 4. Quick Match → Toss → Gameplay

## EXISTING BEHAVIOR
- Pressing PLAY joins a FIFO queue. The moment two players are queued, they're matched immediately — there is no additional lobby step for quick match.
- A client-side 60-second search timeout exists (`useGameSocket.ts`'s own `setTimeout`) — this is a **UX-only** safeguard; the server's queue has no timeout of its own. If it fires, the player sees "No player is active right now. Please try again." and must press PLAY again.
- Once matched, the toss sequence runs (see `GAME_RULES.md`) with no player choice about skipping it.
- Gameplay begins the moment the toss winner's bat/bowl choice resolves (`toss:final`).

## 5. Private Match

## EXISTING BEHAVIOR
- From Home, choosing "Private Match" reveals a compact create/join control (a code-entry field + Join, and a Create New Room button) — not a full separate page in the most recent rebuild attempt (the original implementation used dedicated `/room/create/[code]` and `/room/join/[code]` routes, which still exist and still work, and are the only way to open a shared link from someone else).
- **Creating** a room generates a 6-character code **client-side** (`genCode()`), copies it to the clipboard automatically, and sends it to the server (`room:create`) — the server validates the format but does not generate the code itself. This is a real architectural quirk worth flagging for Unity (see `NETWORK_PROTOCOL.md`/`OPEN_QUESTIONS.md`): whichever client creates the room decides the code.
- The host then waits (`room:waiting`, with a 5-minute expiry countdown) for a second player.
- **Joining** a room by code (`room:joinByCode`) puts both players into a "ready" state (`room:ready`) — critically, **the toss does not start automatically** once two players are in a private room. The host must explicitly press "Start Game" (`room:startGame`). This is a deliberate difference from quick match, which tosses automatically the instant a match is found.
- From `room:startGame` onward, the flow (toss → gameplay) is identical to quick match.

## 6. Practice / Bot Mode

## EXISTING BEHAVIOR
- Entirely client-side, zero network involvement. `startBotGame()` immediately: resets local state, randomly assigns batting/bowling (no toss), shows a fixed 1400ms "Cricket Gods chose you for {inning}" popup, then gameplay begins.
- The "opponent" is a named bot (`"Rizzwon (Bot)"`, hardcoded) whose picks come from the probability-matrix AI in `useBotGame.ts` (see `GAME_RULES.md`).
- No match record is ever persisted for practice games (`persistMatch()` is only called from `server/socket-server.ts`, which bot mode never touches).

## 7. Round-by-round gameplay

## EXISTING BEHAVIOR
- Every round: both players see six number options (1–6), pick one (first pick counts; the UI disables further picks with `hasPickedThisRound`), and wait for the opponent's implicit pick.
- Server reveals both moves simultaneously (`move:roundResult`), the client shows the two chosen numbers for a fixed `CLIENT_ANIMATION_MS` (1500ms) *before* applying the score/inning update — this is a deliberate reveal delay for visual drama, already present in the current product, not something to invent new.
- `ROUND_TIMEOUT_MS` (15,000 ms) per round; an unpicked player is auto-filled with a random move.

## 8. Match completion

## EXISTING BEHAVIOR
- Ends via chase-complete, a second-innings wicket, a walkover (opponent disconnected past the grace period), or — client-side only — a bot-mode timeout/manual path. Every multiplayer ending is persisted to `Match` (see `DATA_MODELS.md`) with a `reason` field distinguishing which.
- The result screen shows a winner string (`"{name} Wins"`, or a hardcoded walkover message, or — bot mode only — a possible draw), final score, and two actions.

## 9. Rematch / Play Again

## EXISTING BEHAVIOR
- **Bot mode:** "Play Again" calls `startBotGame()` directly — a real, clean rematch with no navigation.
- **Multiplayer:** there is no clean rematch path. The current app's only mechanism is a full page reload back to `/` or `/game`, which re-enters the entire flow from Home (see `GAME_STATES.md`'s "no client-side return to Home" note). There is no "same opponent, go again" shortcut, no "return to the same private room" shortcut.

## OPEN QUESTION

- Should multiplayer rematch (same opponent, immediately) be a new capability designed for Unity, given the current web app has none? This would be new behavior, not existing behavior — flagging rather than assuming it should exist.
- Should Private Match's "host must press Start" step be preserved exactly, or does it need adjusting for a mobile context (e.g., auto-start once both are ready, matching quick match)? Not decided here — it's existing, deliberate-looking behavior (the code explicitly avoids auto-starting), so preserving it is the safe default, but flagging since it's a UX decision point.
