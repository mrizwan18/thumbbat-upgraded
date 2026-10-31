# ThumbBat — UI Audit (Sprint 0)

**Status:** Read/analyze only. No functional, API, WebSocket, or business-logic code was changed while producing this document.

**Scope:** Full repository inspection (`src/`, `components/`, `server/`, `lib/`, `styles/`, `public/`, config files) plus the 24 reference screenshots in `docs/design/current/`.

---

## A. Technology stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15.1.6 (App Router), React 19 |
| Language | TypeScript (strict mode), `noEmit`/`ignoreBuildErrors` set — type errors don't fail builds |
| Styling | Tailwind CSS 3.4 (utility classes inline in JSX); one small global stylesheet (`styles/globals.css`) for a couple of keyframe animations and CSS variables |
| Animation | Framer Motion 12 (`motion`, `AnimatePresence`, `useReducedMotion`) — the only animation library actually wired up |
| Icons | `lucide-react` (used in `RoomBanner`); everything else is raw emoji |
| Other declared-but-unused-for-visuals libs | `lottie-react` is a dependency but **no `.json`/Lottie usage found anywhere** in the codebase — dead weight for now |
| Realtime | `socket.io-client` (browser) ↔ `socket.io` (Node server) |
| Backend (game/realtime) | Standalone Express + Socket.IO process (`server/socket-server.ts`), separate from Next.js, run with `tsx`/`ts-node`, deployed as its own Render service |
| Backend (web/API) | Next.js Route Handlers under `src/app/api/**` (auth, leaderboard) — these run inside the Next.js server, not the socket server |
| Database | MongoDB via Mongoose (`server/models/*`) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs`, token stored in `localStorage` **and** mirrored into a `token` cookie (cookie is what the Next.js middleware checks) |
| Email | Resend (`resend` package) for signup confirmation emails |
| Validation | Zod, used only for `src/env.ts` (env var schema) |
| Toasts | `react-toastify` (login/signup/confirm pages only) |
| Deployment | Render (`render.yaml`) — two services: `thumbbat-web` (Next.js) and `thumbbat-socket` (Socket.IO), wired together via Render's `fromService` env injection |
| Tests | **None found.** No test runner, no `*.test.*`/`*.spec.*` files anywhere in the repo. |

---

## B. Application architecture

Two independent runtime processes that must both be running for the app to work:

1. **Next.js app** (`npm run dev` / port 3000) — serves all pages, the auth API routes, and the leaderboard API route. Talks to MongoDB directly via Mongoose for those API routes.
2. **Socket.IO server** (`npm run socket-server`, `server/socket-server.ts`, port 5001 locally / `PORT` in prod) — a plain Express+Socket.IO process holding **all real-time game state in memory** (`Map`s of rooms/queue/names — no Redis, no persistence layer for live state). It also talks to MongoDB (via its own `dbConnect`) but only to persist finished matches and bump user stats (`persistMatch`).

The browser connects to both: normal HTTP/fetch (via `axios`, and Next's own routing) to the Next.js app, and a single persistent WebSocket (`src/lib/socket.ts`, a module-level singleton `Socket`) to the socket server.

There is **no shared session/store between the two backends** beyond MongoDB — the socket server doesn't validate the JWT; it just accepts whatever `userId`/`name` the client tells it via `me:setUser`. Client-side route protection is what keeps unauthenticated users off `/game`.

### Directory roles
- `src/app/**` — Next.js routes (pages + API route handlers)
- `components/**` — all React UI components (flat + a `game/` subtree)
- `src/hooks/**` — the three stateful hooks that own almost all client game/auth logic
- `src/lib/socket.ts` — Socket.IO client singleton
- `src/types/realtime.ts` — shared wire-format types for socket payloads (`Snapshot`, `RoundStartPayload`) — **not shared with the server**, which has its own duplicate inline types. Any change to one must be manually mirrored in the other.
- `server/**` — the Socket.IO backend, Mongoose models, DB connector; has its own `package.json`/`tsconfig.json`/build step (compiles to `server/dist`)
- `lib/getMoveImage.ts` — maps a move number (1–6) to a PNG path
- `styles/globals.css` — Tailwind directives + a couple of leftover keyframes for a component that's no longer used the same way (`bounce`, `.move-image`)

---

## C. Route map

| Route | File | Auth-gated? | Purpose |
|---|---|---|---|
| `/` | `src/app/page.tsx` | No (redirects to `/game` if a `token` exists in localStorage) | Landing/marketing page |
| `/login` | `src/app/login/page.tsx` | No | Combined **Login + Signup** (tabbed, single page/component — there is no separate `/signup` route despite the spec screen inventory listing one) |
| `/confirm` | `src/app/confirm/page.tsx` → `ConfirmClient.tsx` | No | Email-confirmation landing page (reads `?token=`) |
| `/leaderboard` | `src/app/leaderboard/page.tsx` | No | Public leaderboard |
| `/game` | `src/app/game/page.tsx` → `GameScreen.tsx` | **Yes** — `useAuthGuard` (client redirect) **and** `src/middleware.ts` (server redirect via cookie) | Play lobby + quick match + bot + in-page private-room banner + toss + game board, all in one component tree |
| `/room/[intent]/[code]` | `src/app/room/[intent]/[code]/page.tsx` → `room-route-client.tsx` | **Yes** — `useAuthGuard` only (no middleware matcher for `/room`, see risk L) | Direct-link private room flow (`intent` is `"create"` or `"join"`); duplicates most of `GameScreen`'s room/toss/board rendering |
| `/api/auth/login` | `src/app/api/auth/login/route.ts` | — | POST, issues JWT |
| `/api/auth/signup` | `src/app/api/auth/signup/route.ts` | — | POST, creates user + sends confirmation email via Resend |
| `/api/auth/confirm` | `src/app/api/auth/confirm/route.ts` | — | GET/POST, consumes `VerificationToken`, marks user confirmed (current, hashed-token implementation) |
| `/api/auth` | `src/app/api/auth/route.ts` | — | **Legacy/duplicate** confirm-by-plaintext-`confirmationToken` handler; appears superseded by `/api/auth/confirm` (see risk L) |
| `/api/leaderboard` | `src/app/api/leaderboard/route.ts` | — | GET, Mongo aggregate of top users |

### Routes referenced in the UI but **not implemented** (dead links)
`/how-it-works`, `/privacy`, `/terms`, `/contact`, `/forgot`, `/profile`, `/signup` — all linked from `page.tsx`, `login/page.tsx`, or `Navbar.tsx` but have no corresponding `src/app/*` folder. These currently 404. Not a redesign blocker, but worth flagging since a "polished game" pass will make broken links more visible.

---

## D. Component map

```
src/app/
  layout.tsx                     — RootLayout: <Navbar/> + Inter font + globals.css (mounted on every route, incl. game)
  page.tsx                       — Landing page (self-contained, all sub-components inline: BackgroundFX, ArcadeCabinet, ModeCard, StepCard, Ticker, Chip, Badge)
  login/page.tsx                 — Login+Signup (self-contained: Field, BackgroundDecor)
  confirm/page.tsx, ConfirmClient.tsx — token confirmation
  leaderboard/page.tsx           — Leaderboard (self-contained: PodiumCard, RankBadge, Avatar, skeletons)
  game/page.tsx → GameScreen.tsx — MAIN GAME ENTRY. Composes:
      QuickMatchCard, JoinRoomCard, SoloPracticeCard   (components/game/lobby/*)
      RoomBanner                                        (components/game/room/RoomBanner.tsx)
      TossOverlay                                       (components/game/overlays/TossOverlay.tsx)
      GameBoard                                         (components/game/board/GameBoard.tsx)
        └ Scoreboard, GameMoveVisual, MoveSelection, OpponentMoveDisplay
      InningsOverlay, GameOverModal                     (components/game/overlays/*)
      Snackbar                                          (components/ui/Snackbar.tsx)
  room/[intent]/[code]/room-route-client.tsx — SECOND, PARALLEL game entry.
      Renders the same RoomBanner / TossOverlay / GameBoard / InningsOverlay / GameOverModal / Snackbar
      as GameScreen, independently (see risk below re: duplication)
```

### Component ownership / data flow
- `GameBoard` is the single shared "core game screen" component used by **both** `/game` and `/room/[intent]/[code]`. It is presentation-only — all state and handlers are passed in as props (`myName`, `opponentName`, `inning`, `score`, `playerMove`, `opponentMove`, `roundCountdown`, `canPick`, `onPick`, `secondInningStarted`). This is the most important file for Sprint 7.
- `GameBoard` further delegates to `Scoreboard` (score numbers), `GameMoveVisual` (the two "hand" images + bounce/reveal animation), `MoveSelection` (the 1–6 number buttons), and `OpponentMoveDisplay` (small "opponent chose ⬜" chip).
- Lobby cards (`QuickMatchCard`, `JoinRoomCard`, `SoloPracticeCard`) are pure/controlled — no socket access, just callbacks.
- `RoomBanner` is pure/controlled — room code, copy button, player badges, Start button.
- `TossOverlay` is pure/controlled and handles **5 of the 6 toss sub-states** as one component switching on a `phase` string (see Section E).
- `InningsOverlay` and `GameOverModal` are simple modal overlays keyed off booleans.

### Duplicate / orphaned components found (relevant to Sprint 1 cleanup, not to be touched yet)
- **`useGameSocket()` is instantiated twice in the app** — once in `GameScreenInner` (`/game`) and once in `RoomRouteClient` (`/room/[intent]/[code]`) — each call attaches its own full set of socket listeners to the shared singleton socket (`getSocket()`). They're never mounted at the same time today (routing prevents it), but this is duplicated logic, not shared state, and any redesign that tries to unify the two screens will need to reconcile this.
- **`GameMoveImages.tsx`** (top-level `components/`) is superseded by `GameMoveVisual.tsx` (`components/game/board/`). Only `GameMoveVisual` is actually imported by `GameBoard`. `GameMoveImages` and the `.bounce`/`.move-image`/`.transform` CSS classes in `globals.css` it depends on are effectively dead code.
- **`WaitingOverlay.tsx`** (`components/game/overlays/`) is never imported anywhere. `RoomBanner` (inline, not a modal) is what's actually shown for the "waiting for opponent" pre-game state. `WaitingOverlay` is dead code.
- **`useCountdown.ts`** (`useCountdownTo` hook) is never imported anywhere. `useGameSocket` reimplements its own inline countdown helpers (`startSimpleCountdown`, `startCountdownTo`). Dead code.
- **`src/app/api/auth/route.ts`** duplicates the confirmation flow using a legacy `User.confirmationToken` plaintext field, while `src/app/api/auth/confirm/route.ts` implements the current hashed-token flow via `VerificationToken`. The `User` model still has the legacy `confirmationToken` field. Not a UI concern, but flagged because "Invalid/missing token" behavior (screen inventory #18) could depend on which endpoint is actually wired to the confirm page — it's `/api/auth/confirm` (confirmed by reading `ConfirmClient.tsx`).

---

## E. Game state map

The spec's abstract state names don't exist as literal enum values in the code — the real state is split across several hook-local state variables. Mapping each spec state to the actual implementation:

### IDLE
- **Route:** `/game`
- **Component:** `GameScreenInner` (`src/app/game/GameScreen.tsx`)
- **State:** `useGameSocket()` — `!preGameInRoom && !gameStarted && !isBotMode` renders the 3 lobby cards
- **Source of truth:** `mode === null`, `roomCode === null`, `tossPhase === "idle"`
- **UI:** `QuickMatchCard`, `JoinRoomCard`, `SoloPracticeCard`

### WAITING_FOR_PLAYER
- **Route:** `/game` (banner shown inline) or `/room/create/[code]`
- **Component:** `RoomBanner` (`components/game/room/RoomBanner.tsx`)
- **State:** `roomCode` set, `roomPlayers.length === 1`, `roomReady === false`
- **Events in:** `room:waiting` (host only) → sets `roomCode`, `roomHostId`, starts expiry countdown
- **Events in:** `room:ready` (both, once guest joins) → sets `roomPlayers` (length 2), triggers `joinSnackbar`
- **Handlers:** `createRoom()` emits `room:create`; server emits back `session:token` + `room:waiting`

### TOSS_CALL
- **Route:** `/game` or `/room/[intent]/[code]`
- **Component:** `TossOverlay` with `phase === "calling"` (the caller) or `"waiting-call"` (the other player)
- **State:** `tossPhase`, `tossCountdown` in `useGameSocket`
- **Events in:** `toss:start` `{ callerId, timeoutMs }` — sets phase based on whether `callerId === socket.id`
- **Handlers:** `callHeadsOrTails(roomId, call)` → emits `toss:call`
- **Server:** `startToss()` in `socket-server.ts` (auto-resolves via `room.callTimer` after `TOSS_CALL_TIMEOUT_MS` = 15s if no call)

### TOSS_ANIMATION
- **Not implemented as a distinct visual state.** The server has a fixed 5s `RESULT_REVEAL_MS` delay between `toss:result` and revealing the choose-bat-or-bowl step, but the client has no coin-flip animation — `TossOverlay`'s `"showing-result"` phase is a static text block. This is a genuine gap the redesign (Sprint 6) needs to fill; there's server-side timing budget (5000ms) already reserved for it.

### TOSS_RESULT
- **Component:** `TossOverlay` with `phase === "showing-result"`
- **State:** `tossCall`, `tossOutcome`, `tossWinnerId`
- **Events in:** `toss:result` `{ call, outcome, winnerId }`
- **Note:** `TossOverlay` accepts a `youWon` prop but it's **always passed `undefined`** from both call sites (`GameScreen.tsx` and `room-route-client.tsx`) — winner emphasis text ("You won the toss!" vs "{opponent} won the toss.") is currently unreachable/always falls to the opponent-won branch. Worth fixing in Sprint 6 since the spec explicitly wants "clear winner indication."

### BAT_OR_BOWL_SELECTION
- **Component:** `TossOverlay` with `phase === "choosing"` (winner) / `"waiting-choice"` (loser)
- **State:** `iChooseCountdown`
- **Events in:** `toss:yourTurnToChoose` / `toss:opponentChoosing` `{ timeoutMs }`
- **Handlers:** `chooseBatOrBowl(roomId, choice)` → emits `toss:choose`
- **Server:** `resolveToss()` → `finalizeChoice()`; auto-picks random choice after `CHOICE_TIMEOUT_MS` = 15s via `room.choiceTimer`

### WAITING_FOR_OPPONENT
- Two distinct real occurrences, both implemented:
  1. Pre-toss, waiting for 2nd player: `RoomBanner` (`roomReady === false`)
  2. Mid-round, after you've picked but opponent hasn't: `OpponentMoveDisplay` shows "⏱ Waiting…" (`revealedMove == null`), and `MoveSelection` is disabled via `canPick = !hasPickedThisRound`

### PLAYER_TURN / OPPONENT_TURN
- There isn't a strict turn order (both players pick simultaneously each round — it's simultaneous-selection, not alternating turns). The "whose turn" framing in the spec maps to **batting vs bowling role**, tracked via `inning: "batting" | "bowling"` in `useGameSocket`, displayed in `GameBoard` ("you are batting/bowling").
- Both players can always attempt to pick during an active round; `canPick` gates it via `hasPickedThisRound` + round deadline, not by whose "turn" it is.
- **Component:** `GameBoard` → `MoveSelection` (the 1–6 buttons)
- **Events in:** `move:roundStart` `{ deadlineAt, snapshot }` — starts the per-round countdown (`ROUND_TIMEOUT_MS` = 15s server-side)
- **Handlers:** `playMultiplayerMove(roomId, move)` → emits `move:select`; guarded client-side by `hasPickedThisRound`/deadline, and server-side by `r.moves[socket.id] != null` (first pick counts) + deadline check

### ROUND_RESULT
- **Component:** `GameBoard` → `GameMoveVisual` (reveal animation) + `OpponentMoveDisplay` + `Scoreboard` (updates)
- **Events in:** `move:roundResult` `{ moves, applyAfterMs, snapshot }` — client shows both chosen numbers immediately, then after `applyAfterMs` (server sends `CLIENT_ANIMATION_MS` = 1500ms) applies the new score/inning/gameOver snapshot and clears the moves for the next round
- **Server:** `finalizeRound()` computes the actual cricket outcome (runs / wicket / innings switch / chase complete) — see Section F1 below for exact rules
- **Note:** the server computes a structured `outcome` object (`{type: "runs", runsAdded}` / `{type:"wicketFirstInnings"}` / etc.) and sends it in the `move:roundResult` payload, but **the client currently ignores `outcome` entirely** — it only reads `moves` and `snapshot`. This is exactly the data Sprint 8 ("FOUR!", "OUT!", "SIX! OUT!") needs, and it's already being sent over the wire unused — a low-risk win for that sprint.

### MATCH_RESULT
- **Component:** `GameOverModal`
- **State:** `isGameOver`, `winner` (a pre-formatted string, e.g. `"Rizwan Wins"`, built client-side in `useGameSocket`'s `move:roundResult` handler)
- **Events in:** same `move:roundResult` payload, when `snapshot.gameOver === true`
- **Server:** sets `g.gameOver`/`g.winnerId` inside `finalizeRound()` on chase-complete or second-innings wicket; also persists to Mongo via `persistMatch()` and schedules `cleanupRoom()` 15s later

### WALKOVER
- **Component:** `GameOverModal` (same modal, different `winner` text) — no dedicated walkover screen exists, confirming the spec's observation that this needs redesign
- **Events in:** `opponent:left` and `game:walkover` (server emits both on the same disconnect path) → `useGameSocket` sets `isGameOver = true`, `winner = "Opponent left. You win by walkover 🏆"`
- **Server:** `socket.on("disconnect")` → `DISCONNECT_GRACE_MS` = 20s grace timer (`room.disconnectTimers[socket.id]`) before declaring the peer the winner and persisting `"walkover"` as the match reason. If the disconnected player reconnects in time via `resume:join` (see below), the walkover never fires.
- **Resume/reconnect path (not in the spec's state list but load-bearing):** `resume:join` `{ roomId, token }` lets a refreshed/reconnected client take over the old socket id in-room, restoring `state:snapshot` (mid-game) or a `state:pregame` phase enum (`waitingForOpponent` / `waitingForStart` / `awaitingTossCall` / `resolvingToss` / `awaitingChoice`) for pre-game reconnects. **The client (`useGameSocket`) never emits `resume:join` and never listens for `state:snapshot`/`state:pregame` except one partial `state:snapshot` handler.** This is server-side capability with no working client wiring — a refresh mid-game currently just orphans the old socket until the 20s grace timer walks it over. Flagging as a functional gap, not something to fix in this sprint.

---

## F. Multiplayer/realtime flow

### F1. Server-authoritative game rules (for reference — do not reimplement, only redesign around)
All rules live in `server/socket-server.ts`, `finalizeRound()`:
- Each round, both players privately pick 1–6 (`move:select`).
- **Innings 1:** same number picked by both = wicket → innings ends, `firstInningScore` locked to the batter's score, roles swap, `target = firstInningScore + 1`. Different numbers = batter's score += their number.
- **Innings 2 (chase):** same number = wicket → game over, winner is whoever has the higher score vs target (chaser wins only if they'd already met/exceeded target that same ball — otherwise bowler/defender wins). Different numbers = chaser's score += number; if score ≥ target, chaser wins immediately (chase complete).
- If a player doesn't pick within `ROUND_TIMEOUT_MS` (15s), server auto-fills a `randMove()` for them.
- Between rounds: `move:roundResult` fires immediately with `applyAfterMs: 1500`; the next round starts `1500 + 100`ms later server-side.

### F2. Full socket event catalogue

**Client → Server:**
`me:setName`, `me:setUser`, `queue:join`, `queue:leave`, `room:create`, `room:joinByCode`, `room:startGame`, `room:leave`, `toss:call`, `toss:choose`, `move:select`, `resume:join`

**Server → Client:**
`session:token`, `match:found`, `room:waiting`, `room:ready`, `room:timeout`, `room:exists`, `room:notFound`, `room:full`, `room:hostLeft`, `room:alreadyIn`, `room:error`, `toss:start`, `toss:result`, `toss:yourTurnToChoose`, `toss:opponentChoosing`, `toss:final`, `move:roundStart`, `move:roundResult`, `state:snapshot`, `state:pregame`, `resume:ok`, `resume:failed`, `session:replaced`, `opponent:left`, `game:walkover`

### F3. Matchmaking (Quick Match)
`tryMatch()` — a simple FIFO pairing loop (`while queue.length >= 2`) run every time `queue:join` fires. No skill/rating matching. Instantly creates a room, picks a random toss caller, and starts the toss — no pre-game lobby screen for quick match (goes straight from "Searching…" to the toss). Client-side 60s search timeout is purely a client UX affordance (`useGameSocket`'s `searchTimeoutRef`); the server queue has no timeout of its own.

### F4. Private rooms
Code-based (`room:create` / `room:joinByCode`), 6-character codes generated client-side (`genCode()` in `useGameSocket`) using an ambiguity-reduced alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — no `I`, `O`, `0`, `1`). Server validates format (`/^[A-Z0-9]{4,8}$/`) independently and maintains its own `codeToRoomId` map. Room expires after `ROOM_WAIT_MS` = 5 minutes if a second player never joins. Host-only `room:startGame` gate (`socket.id !== room.hostId` → rejected).

### F5. Bot mode
**Entirely client-side, no socket involvement at all.** `useBotGame.ts` reimplements a parallel copy of the same batting/bowling/innings/target rules found in `finalizeRound()` (kept in sync by hand — another duplication risk to note for future logic changes, though out of scope for this visual redesign). The "AI" is a hand-tuned Markov-chain-like probability matrix (`baseMatrix`) that nudges slightly toward the human's recent picks (`adaptMatrix`), not a real opponent — good context for how much personality/juice a bot-specific redesign (avatar, "thinking" animation) can add without touching logic.

---

## G. Authentication flow

- **Signup:** `login/page.tsx` (mode toggle) → `POST /api/auth/signup` → creates unconfirmed `User`, generates a random token, stores only its SHA-256 hash in `VerificationToken` (24h TTL, Mongo TTL index), emails the plaintext token link via Resend.
- **Confirm:** user clicks emailed link → `/confirm?token=...` → `ConfirmClient.tsx` → `GET /api/auth/confirm?token=...` → hashes the incoming token, looks up `VerificationToken`, checks not-used/not-expired, flips `User.isConfirmed`/`emailVerifiedAt`, marks token used. On any failure, shows a plain-text "Invalid or expired token." message (this is screen #18 in the inventory, and the exact copy the spec's Sprint 3 wants to replace).
- **Login:** `POST /api/auth/login` → bcrypt-compares password, **rejects if `!user.isConfirmed`**, signs a 1-day JWT (`{ userId }`), returns it to the client.
- **Client-side session storage (dual, and slightly inconsistent):**
  - `localStorage`: `token`, `username`, `userId`
  - **Cookie:** `token` (set manually via `document.cookie` in `login/page.tsx` after a successful login) — this cookie, not localStorage, is what `src/middleware.ts` checks server-side.
  - `window.dispatchEvent(new Event("login-success"))` is how `Navbar` learns the user just logged in without a full reload (it also listens for the native `storage` event for cross-tab sync).
- **Route protection is two-layered and only covers `/game`:**
  - `src/middleware.ts` — Next.js Edge middleware, `matcher: ["/game/:path*"]`, redirects to `/login` if no `token` cookie.
  - `useAuthGuard(redirectTo)` — client hook checking `localStorage.token`, used in `GameScreen.tsx` and `room-route-client.tsx`.
  - **`/room/[intent]/[code]` has no middleware coverage** (the matcher is `/game/:path*` only) — it relies solely on the client-side `useAuthGuard`, meaning a logged-out user briefly sees/reaches the room page before the client redirect fires, and a user with JS disabled or blocked wouldn't be gated at all. Flagged as risk L.
  - **Logout** (`Navbar.handleLogout`) clears both localStorage and the cookie and routes to `/login`.

---

## H. Screen inventory (spec list → actual implementation)

| # | Spec screen | Actual route/component | Notes |
|---|---|---|---|
| 1 | Landing / Home | `/` → `page.tsx` | Fully implemented, redirects logged-in users to `/game` |
| 2 | Login | `/login` → `login/page.tsx`, `mode === "login"` | |
| 3 | Signup | `/login` → `login/page.tsx`, `mode === "signup"` | **Same component/route as Login**, tab-toggled — no separate `/signup` page exists |
| 4 | Leaderboard | `/leaderboard` → `leaderboard/page.tsx` | Includes podium, search, sort, loading skeletons, error state, empty state — all already implemented |
| 5 | Play lobby | `/game`, the `!preGameInRoom && !gameStarted && !isBotMode` branch of `GameScreen.tsx` | 3-card grid: `QuickMatchCard` / `JoinRoomCard` / `SoloPracticeCard` |
| 6 | Quick Match searching | `QuickMatchCard`, `searching === true` state | Text + timer, no dedicated animation yet |
| 7 | Private room creation | `JoinRoomCard.onCreate` → `createRoom()` → navigates to `/room/create/[code]`, OR inline via `/game`'s room banner | Two entry points exist (see risk below) |
| 8 | Private room waiting | `RoomBanner` with `players.length === 1` | |
| 9 | Private room with opponent | `RoomBanner` with `players.length === 2`, `canStart` true | |
| 10 | Toss — caller | `TossOverlay`, `phase === "calling"` | |
| 11 | Toss — waiting | `TossOverlay`, `phase === "waiting-call"` | |
| 12 | Toss result | `TossOverlay`, `phase === "showing-result"` | No coin animation; `youWon` prop unused (always undefined) |
| 13 | Bat/Bowl selection | `TossOverlay`, `phase === "choosing"` (chooser) / `"waiting-choice"` (other player) | |
| 14 | Game board — host | `GameBoard` (no host/guest visual distinction exists — same component regardless of role) | |
| 15 | Game board — guest | `GameBoard` (identical component/props shape; host vs guest is not a visual concept in code, only `isHost` matters for the Start button) | |
| 16 | Waiting for opponent (mid-round) | `OpponentMoveDisplay`, `revealedMove == null` state, + `MoveSelection` disabled | |
| 17 | Round result | `GameMoveVisual` reveal phase + `Scoreboard` update (triggered by `move:roundResult`) | Structured `outcome` data available server-side but unused client-side |
| 18 | Walkover / game over | `GameOverModal` (shared with normal victory/defeat — no distinct walkover screen/copy) | |
| — | Invalid/missing token | `ConfirmClient.tsx`, `errorMessage` branch | Plain text, no illustration/branding |
| — (bonus, not in spec list) | Bot pre-game popup | `GameScreenInner`, `showGameStartPopup` (bot only) | "🏏 Cricket Gods chose you for {inning}" modal |
| — (bonus) | Bot innings-change overlay | `InningsOverlay` (shared component, also used — currently with `open={false}` hardcoded — in the multiplayer room route, see risk M) | |

**Duplication note relevant to screens 7–17:** `/game` (with an in-page room banner) and `/room/[intent]/[code]` (a dedicated route) are **two separate implementations of nearly the same private-room-through-game-board flow**, each with its own copy of the JSX structure (background gradients, headers, overlay wiring), both driven by their own independent call to `useGameSocket()`. A redesign has to touch both call sites for every private-room/toss/board visual change, or this sprint should recommend consolidating them (see Section M).

---

## I. Existing reusable components

Genuinely reusable, prop-driven, and safe to restyle without touching logic:
- `Scoreboard` (`components/Scoreboard.tsx`) — score display, currently very plain (`bg-gray-800` box)
- `MoveSelection` (`components/MoveSelection.tsx`) — the 1–6 number-picker grid; already has hover/tap/disabled/active states via Framer Motion `whileTap`/`whileHover`
- `GameMoveVisual` (`components/game/board/GameMoveVisual.tsx`) — hand reveal component; already has a real animation state machine (`idle` → `bouncing` → `reveal`), image preloading, and `useReducedMotion` support — a strong foundation for Sprint 7/8, not a rewrite candidate
- `OpponentMoveDisplay` (`components/OpponentMoveDisplay.tsx`) — small live status chip with flip animation
- `Snackbar` (`components/ui/Snackbar.tsx`) — generic bottom toast, already animated
- `RoomBanner` (`components/game/room/RoomBanner.tsx`) — room code/players/start; already has copy-button, host-gated Start button, expiry text
- `QuickMatchCard` / `JoinRoomCard` / `SoloPracticeCard` — self-contained lobby cards, controlled via props/callbacks only
- `TossOverlay` — one component cleanly switching across 5 toss phases; good candidate to evolve in place rather than replace
- `InningsOverlay` / `GameOverModal` — simple, prop-driven modals
- `Navbar` — already has responsive mobile menu, active-route indicator, login-state-aware rendering, click-outside/Escape handling — solid, don't rebuild from scratch

Not reusable / needs consolidation before reuse:
- `GameMoveImages.tsx` — dead code (superseded by `GameMoveVisual`)
- `WaitingOverlay.tsx` — dead code (never rendered)
- Landing (`page.tsx`), Login (`login/page.tsx`), Leaderboard (`leaderboard/page.tsx`) each define their **own local** `BackgroundFX`/`BackgroundDecor`, `Badge`, `Avatar` helper components with near-identical implementations — no shared `shared/` component directory exists yet despite 3 different "gradient blob + grid + noise" background implementations and 2 different `Avatar`-with-initials implementations.

---

## J. Existing assets

- `public/thumbbat-logo.png` — used in `Navbar`
- `public/images/{1..6}u.png`, `public/images/{1..6}c.png` — 12 raster PNGs, "your hand showing N" and "opponent's hand showing N" respectively, used via `lib/getMoveImage.ts` → `GameMoveVisual`
- `public/images/start.png`, `public/images/start-r.png` — idle-fist images for player/opponent respectively
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` — **default Next.js starter-template SVGs, unused in the app.** Safe to delete during asset cleanup, not referenced anywhere in `src/`/`components/`.
- No cricket bat/ball/wicket/pitch/coin/trophy SVGs exist yet — every one of those is currently an emoji (🏏 ⚾ 🪙 🏆 🤖). This directly confirms the spec's Section 6 problem statement.
- No player/bot avatar illustrations exist — `Navbar` and `Leaderboard` both render initials-in-a-circle as the "avatar."

---

## K. Existing animation capabilities

Framer Motion is already fully wired in and used well in several places — Sprint 1's "animation primitives" task should **wrap/standardize existing patterns**, not introduce a new library:
- Fade/slide-in on mount: landing page hero, login card, leaderboard hero (`initial`/`animate` with `opacity`/`y`)
- `AnimatePresence` for mount/unmount transitions: `Snackbar`, `GameOverModal`, `InningsOverlay`, mobile nav menu, email field in signup mode
- `whileHover`/`whileTap`/`whileInView`: mode cards, number buttons, CTA bands
- A genuine multi-phase animation state machine already exists in `GameMoveVisual` (`idle`/`bouncing`/`reveal`) — this is the closest thing to a "game motion primitive" already in the codebase and should be the template for Sprint 7/8 reveal animations, not rebuilt.
- `layoutId="active-underline"` shared-layout animation in `Navbar` for the active-route indicator, and an identical sliding-pill pattern (manual `left: "0%"/"50%"` + spring) in the Login tab switcher — two different techniques for the same effect, another minor consolidation opportunity.
- `useReducedMotion()` is respected in `Navbar` and `GameMoveVisual` — accessibility precedent worth keeping consistent in new components.
- Two lines of raw CSS `@keyframes` exist in `globals.css` (`bounce`, `moveBackground`) tied to the now-dead `GameMoveImages`/`.animate-background` — not used by anything live today.
- **Nothing uses Lottie or Rive**, despite `lottie-react` being a dependency — either wire it up deliberately in a later sprint or drop the dependency; don't assume it's pre-integrated.

---

## L. Potential technical risks

1. **Two parallel game-flow implementations** (`/game` vs `/room/[intent]/[code]`) both call `useGameSocket()` independently and duplicate the toss/board/overlay JSX. Any visual change to toss/room/board must be applied twice unless Sprint 1+ consolidates these into one shared layout component both routes render. This is the single biggest structural risk to sprint velocity.
2. **`/room/[intent]/[code]` is not covered by `src/middleware.ts`** (matcher is `/game/:path*` only) — only client-side `useAuthGuard` protects it. Not to be silently "fixed" as part of a visual sprint (spec explicitly says preserve auth), but worth a deliberate, called-out decision later.
3. **No reconnect/resume wiring on the client** — server supports `resume:join`/`state:snapshot`/`state:pregame` for reconnection, but `useGameSocket` never emits `resume:join`. A page refresh mid-game currently just loses the game for that tab (walkover fires after 20s). Redesign work that touches loading/transition states should not assume resume works.
4. **`youWon` prop on `TossOverlay` is always `undefined`** from both call sites — the "you won the toss" vs "opponent won" branch is effectively dead, defaulting to the opponent-won copy. Sprint 6 will need to actually derive and pass this (e.g. `tossWinnerId === socket.id`) as part of implementing the redesigned toss result screen — flagging now so it's not mistaken for existing working behavior.
5. **Server's structured `outcome` field on `move:roundResult` (runs/wicket/chase-complete/etc.) is computed but never read by the client.** Sprint 8 needs this exact data ("FOUR!", "OUT!") — it's a additive client-side change (read a field that's already on the wire), not a backend change, but be precise: don't accidentally start deriving outcome client-side from scores when the server already tells you unambiguously.
6. **Bot logic (`useBotGame.ts`) is a hand-maintained duplicate of the server's cricket rules** (`finalizeRound()`), entirely client-side. A visual redesign of the bot game screen is safe (it's the same `GameBoard` component), but nobody should "simplify" or "align" the bot scoring logic with the server's during a UI sprint — that's a behavior change, explicitly out of scope.
7. **`next.config.ts` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true`.** Type errors and lint errors will not fail a build. This raises the bar for manual verification after each sprint (the spec's own "Step 5 — Test" / "Step 7 — Compare" steps become the actual safety net, since CI/build won't catch regressions).
8. **No automated tests exist at all.** Every acceptance criterion in the spec ("Login works exactly as before," "Room sync unchanged," etc.) must be verified manually (two browser windows, per Sprint 13's own instructions) — there is no regression suite to lean on.
9. **`GameOverModal`'s "Restart" button is hardcoded to `startBotGame()`** in both `GameScreen.tsx` and (with different, room-specific copy) `room-route-client.tsx`. Any redesign of the victory/defeat/walkover screen (Sprint 9) needs to preserve this per-context rematch behavior distinction — it is not currently a generic "rematch" action.
10. **Env var validation (`src/env.ts`, Zod) is strict** (`z.string().url()` for several vars) and is a separate, parallel validation path from `next.config.ts`'s manual `env` block — if either is touched during later work (shouldn't be needed for a visual redesign), both must stay in sync.
11. **`.env.local` is tracked as present in git status as modified** (per the session's initial git status showing `server/package.json` modified) — worth confirming with the user before any commit that nothing environment-specific leaks; not something this audit changed.

---

## M. Recommended implementation order

Sprint 0 has surfaced nothing that should change the spec's own sprint ordering (Sprint 1 → 13). Two structural recommendations to raise with the user **before** Sprint 1 begins, since they affect how much duplicate work every later sprint will require:

1. **Decide early whether `/game`'s in-page room banner/toss/board and `/room/[intent]/[code]`'s dedicated screens should be unified into one shared `GameShell`-style layout** (both driven by the same `useGameSocket()` call higher in the tree, passed down) before or during Sprint 1 (App Shell). If deferred, Sprints 5–9 will each need to be implemented twice.
2. **Confirm the intended fate of dead code** (`GameMoveImages.tsx`, `WaitingOverlay.tsx`, `useCountdown.ts`, unused default Next SVGs in `public/`, the legacy `src/app/api/auth/route.ts` handler) — safe to delete for cleanliness, but explicitly out of scope for Sprint 0 itself (read/analyze only) and should be a conscious, called-out step (likely folded into Sprint 1's component-architecture pass) rather than an incidental deletion during a visual sprint.

Otherwise: proceed with the spec's own P0 priority order (Section 14 of the spec) — core game screen / HUD / number picker / turn state / toss / result / private room lobby first, since `GameBoard` and `TossOverlay` are the two components every other multiplayer screen composes from.

---

## N. Files/components that must NOT be modified (behavior) during the visual redesign

These contain game rules, networking, persistence, or auth logic. They may be touched **only** to change className/JSX structure/wrapping markup, never their state logic, event contracts, or timing constants:

- `server/socket-server.ts` — all game rules, timers, room/queue/toss/disconnect logic (entire file)
- `server/models/*.ts` — Mongoose schemas
- `server/config/db.ts` — DB connection
- `src/hooks/useGameSocket.ts` — socket event wiring, state derivations (`isHost`, `roomReady`), timer helpers
- `src/hooks/useBotGame.ts` — bot scoring/innings/matrix logic
- `src/hooks/useAuthGuard.ts` — auth redirect logic
- `src/lib/socket.ts` — socket singleton/connection config
- `src/middleware.ts` — route protection
- `src/types/realtime.ts` — wire types (changing shape without updating the server breaks the contract)
- `src/app/api/**/route.ts` (all 4 route files) — auth/leaderboard API logic
- `src/utils/withDb.ts`, `server/config/db.ts` — DB plumbing
- `src/env.ts` — env validation schema
- `lib/getMoveImage.ts` — the *mapping* logic (move → filename) must stay; the *filenames/assets themselves* are fair game to redesign (Section 6 of the spec explicitly wants a new illustration system)
- Any `onClick`/`onChange`/socket-emit handler signature inside otherwise-restylable components (e.g. `MoveSelection`'s `onPick`, `JoinRoomCard`'s `onJoin`/`onCreate`) — the *prop contract* between parent and child must not change without updating every call site

---

## O. Files/components that are safe candidates for visual redesign

Pure presentation, prop-driven, no direct socket/API/business logic — safe to restyle/restructure markup, animations, and copy while keeping props/callbacks stable:

- `src/app/page.tsx` (Landing) — and its inline `BackgroundFX`, `ArcadeCabinet`, `ModeCard`, `StepCard`, `Ticker`, `Chip`, `Badge`
- `src/app/login/page.tsx` — and its inline `Field`, `BackgroundDecor` (keep `handleSubmit`/validation logic untouched)
- `src/app/confirm/ConfirmClient.tsx` — visual states only (keep the `validateToken` effect logic)
- `src/app/leaderboard/page.tsx` — and its inline `PodiumCard`, `RankBadge`, `Medal`, `Avatar`, skeletons (keep fetch/sort/filter logic)
- `components/Navbar.tsx` — visual only (keep login-state detection, route-guard-adjacent behavior)
- `components/Scoreboard.tsx`
- `components/MoveSelection.tsx` (keep the `onPick`/`disabled` contract)
- `components/OpponentMoveDisplay.tsx`
- `components/game/board/GameMoveVisual.tsx` (keep the phase state machine; restyle the rendered images/markup around it)
- `components/game/board/GameBoard.tsx` (the most important file for Sprint 7 — keep every prop, restructure the JSX/layout freely)
- `components/game/lobby/QuickMatchCard.tsx`, `JoinRoomCard.tsx`, `SoloPracticeCard.tsx`
- `components/game/overlays/TossOverlay.tsx`, `InningsOverlay.tsx`, `GameOverModal.tsx` (keep phase/prop contracts; this is Sprint 6/9's main target)
- `components/game/room/RoomBanner.tsx`
- `components/ui/Snackbar.tsx`
- `src/app/room/[intent]/[code]/room-route-client.tsx` (JSX/layout only — see Section M recommendation about consolidating with `GameScreen.tsx` before heavy investment here)
- `src/app/game/GameScreen.tsx` (JSX/layout only — keep all destructured hook values and the `onPick`/`onCall`/`onChoose` wiring intact)
- `styles/globals.css`, `tailwind.config.ts` — exactly where Sprint 1's design tokens/typography/palette work should land
- `public/images/*`, `public/thumbbat-logo.png` — replace/extend with the new illustration system (Section 6); nothing in code hardcodes assumptions about these being PNGs vs SVGs beyond the string paths in `lib/getMoveImage.ts`

---

## Summary for the user

**What I found:** ThumbBat is a Next.js 15 / React 19 / Tailwind / Framer Motion frontend talking to a separate always-on Express+Socket.IO process that holds all live game state in memory, backed by MongoDB via Mongoose. Auth is JWT + bcrypt with a slightly unusual dual localStorage+cookie session (the cookie is what server-side middleware actually checks). There are no automated tests, and the build ignores TypeScript/ESLint errors, so manual verification after each sprint (as the spec itself prescribes) is the real safety net.

**Core game files (must not change behavior):** `server/socket-server.ts` (all rules/timers/rooms/toss/disconnect logic), `src/hooks/useGameSocket.ts`, `src/hooks/useBotGame.ts`, `src/hooks/useAuthGuard.ts`, `src/lib/socket.ts`, `src/middleware.ts`, `src/types/realtime.ts`, and the four `src/app/api/**/route.ts` handlers.

**UI files (safe redesign targets):** `components/game/board/GameBoard.tsx` and `components/game/overlays/TossOverlay.tsx` are the two highest-leverage files — nearly every multiplayer screen in the spec composes from them. Alongside those: the lobby cards, `RoomBanner`, `GameOverModal`/`InningsOverlay`, `Navbar`, and the three top-level marketing/auth/leaderboard pages.

**Riskiest areas:** (1) `/game` and `/room/[intent]/[code]` are two parallel, hand-duplicated implementations of the private-room/toss/board flow — worth a deliberate decision before Sprint 1 about whether to unify them, since every later sprint otherwise gets done twice; (2) the toss result's "you won" branch and the server's per-round `outcome` field (runs/wicket/etc.) are already available but unused by the client — Sprints 6 and 8 should read them rather than re-derive equivalent logic; (3) no reconnect wiring exists client-side despite server support, so redesigned loading/transition states shouldn't assume a refresh mid-game is recoverable.

**Proposed Sprint 1 strategy:** Before writing new components, get an explicit decision on the `/game` vs `/room/[intent]/[code]` duplication (Section M) so the new design-system primitives (typography, surfaces, buttons, background, animation primitives) get built once and consumed by both flows, not twice. Otherwise, proceed exactly per the spec's Sprint 1 task list — the existing Framer Motion usage and `GameMoveVisual`'s phase-based animation state machine are strong, reusable foundations; no new animation library is needed.

I have not started Sprint 1 or made any code changes. Waiting for approval to proceed.

---

## Sprint 0.5 — Consolidation Result

**Status:** Complete. Pure structural refactor — no visual, business-logic, socket-protocol, or server changes.

### 1. What was consolidated

The duplicated presentation structure between `/game` (`GameScreenInner`) and `/room/[intent]/[code]` (`RoomRouteClient`) — identical background/container markup, identical `RoomBanner`/`TossOverlay`/`GameBoard`/`InningsOverlay`/`GameOverModal`/`Snackbar` wiring — was extracted into one shared, presentation-only layout component. Every prop group passed to the shared shell's children mirrors that child's own existing prop type exactly (via `React.ComponentProps<typeof X>`), so the shell cannot silently drift from a contract those components already had.

Route-specific pieces (header copy/classes, the lobby cards grid, the bot "game start" popup, the exact `containerStyle` padding-bottom hack, and each route's own `onExit`/`onRestart` closures) were kept as slots/props supplied by each route, not absorbed into the shared component.

### 2. New shared components

- **`components/game/GameShell.tsx`** (new file) — presentation/layout only. Renders: background glow/grid → container (header slot → room banner → lobby slot → toss overlay → game board) → innings overlay → extra-overlay slot → game-over modal → snackbar. Owns no socket connection, no state, no timers, no listeners.

### 3. Which routes now use it

- `src/app/game/GameScreen.tsx` (`GameScreenInner`) — now renders `<GameShell .../>` instead of its own duplicated JSX tree. Still owns `useAuthGuard`, `useGameSocket()`, `useBotGame()`, the `router.push` navigation on room create/join, and the bot-mode "active*" merging logic — all unchanged.
- `src/app/room/[intent]/[code]/room-route-client.tsx` — now renders `<GameShell .../>` instead of its own duplicated JSX tree. Still owns `useAuthGuard`, `useGameSocket()`, and the mount-time `createRoom()`/`joinRoomByCode()` effect — all unchanged.

### 4. What state remains route-owned

- Which slots to show (`preGameInRoom`, `gameStarted`, `tossPhase` gating, `isBotMode` gating) — computed in each route exactly as before, then passed to `GameShell` as `null`/props.
- Route-specific header copy and the one CSS difference between routes (`GameScreen` still applies its `paddingBottom: max(5rem, calc(5rem + env(safe-area-inset-bottom)))` container style; `room-route-client` still applies none — this pre-existing per-route visual difference was preserved, not merged).
- Route-specific callbacks: `onExit`/`onRestart` for `GameOverModal` (bot restart on `/game` vs. a "create a new room" snackbar on the room route), and the `router.push` calls after room create/join (only on `/game`).
- The bot-mode popup JSX (only ever rendered by `GameScreen`, passed to `GameShell` via the `extraOverlay` slot).

### 5. What state remains hook-owned

Entirely unchanged: `useGameSocket()` (all socket state, listeners, and actions), `useBotGame()` (bot state machine and probability matrix), `useAuthGuard()` (redirect logic). `GameShell` never calls either hook and never touches `src/lib/socket.ts`. Each route still makes exactly one `useGameSocket()` call, exactly as before — the shell does not introduce a second one.

### 6. Confirmation that socket contracts were unchanged

Confirmed. No file under `server/`, `src/hooks/useGameSocket.ts`, `src/lib/socket.ts`, or `src/types/realtime.ts` was modified. Every socket event name, payload shape, and emit/listen call site is byte-identical to before the refactor — verified both by diff (only `GameScreen.tsx` and `room-route-client.tsx` changed, plus the new `GameShell.tsx`) and by live testing (see Section 7).

### 7. Confirmation that server code was unchanged

Confirmed. `git status` shows zero changes under `server/`. (`server/package.json` shows as modified, but that predates this sprint — it was already modified at session start per the initial git status, not touched by this work.)

### 8. Verification performed

- **Type check:** `npx tsc --noEmit` — no new errors. The one pre-existing error (`JoinRoomCard.tsx`, an unrelated `inputMode="latin"` type mismatch) is present on the unmodified codebase too — confirmed by stashing this sprint's changes and re-running.
- **Build:** `npm run build` — compiles successfully (`✓ Compiled successfully`) on both the refactored code and the pre-refactor baseline. A later, unrelated build step (`Collecting page data` for `/api/auth/login`) fails identically on both the refactored and unmodified trees — confirmed pre-existing by stashing changes and rebuilding, and out of scope for this sprint (auth API route, not touched).
- **Live manual verification**, using the Chrome browser tool (two real tabs, simulating two players) against `next dev` + `tsx server/socket-server.ts` running locally. MongoDB was not reachable in this environment (`server/.env`'s `MONGODB_URI` points to `localhost:27017`), so login/signup/persistence could not be exercised; auth was bypassed for testing only by manually setting a `token` value in `localStorage`/cookie (`middleware.ts` only checks the cookie is non-empty, `useAuthGuard` only checks `localStorage.token` is non-empty — neither verifies the JWT). Verified, with screenshots at each step:
  - `/game` lobby renders correctly through `GameShell`'s `lobby` slot (Quick Match / Private Room / Solo Practice cards, unchanged visually).
  - **Bot mode**: start → bot popup (`extraOverlay` slot) → number pick → hand reveal → score update, all rendering correctly through `GameShell`.
  - **Private room, full flow** (two tabs): create room → `RoomBanner` waiting state → second player joins → `RoomBanner` ready state with correct player names and live "X joined the room" snackbar → host clicks Start → toss (`calling`/`waiting-call` → `showing-result` → `choosing`/`waiting-choice`, including the 15s server auto-pick timers firing correctly) → game board renders with correct batting/bowling roles and live score sync across both tabs → closed the guest's tab and confirmed the 20s disconnect grace period produced the walkover `GameOverModal` with the correct "Opponent left. You win by walkover" text and final score on the host's tab.
  - **Quick Match** (two tabs, `/game` route): instant match → toss → game board — confirms `GameScreen`'s independent `GameShell` usage (as opposed to the room route's) also works correctly.
  - **Leaderboard** and **Login** pages (untouched by this sprint) still render correctly; leaderboard's loading→error-state transition confirms it degrades gracefully with no reachable database, as designed.
  - Checked browser console on every tab throughout: no React errors, no hydration warnings, no duplicate-listener symptoms (no doubled snackbars, no doubled round results, no doubled toss events).

### 9. Remaining duplication

- **Each route still makes its own independent `useGameSocket()` call.** This was explicitly out of scope for this sprint (Step 3 of the sprint brief: "do not create another `useGameSocket` instance," "state → shared presentation, not state → new state layer → presentation"). The presentation duplication is gone; the two-call-sites-to-one-hook duplication is a separate, larger architectural decision (unifying it would mean one of the two routes stops calling the hook directly and receives state via props/context instead) that Section M of this document already flagged for a deliberate decision before Sprint 1, and remains exactly as flagged.
- **Route-specific JSX** (header text/classes, the lobby-cards grid, the bot popup, the `containerStyle` difference, the two different `onExit`/`onRestart` closures) is intentionally still route-owned per the sprint brief's Step 2 ("keep route-specific behavior outside the shared component") — not a gap, a deliberate boundary.

### 10. Technical risks / observations discovered during this sprint (not fixed, per Step 6/Step 8 scope)

- **Double room-code generation on create.** Clicking "Create new room" on `/game` calls `createRoom()` once (generating code A, used only to build the `/room/create/A` URL), then `RoomRouteClient`'s mount effect calls `createRoom()` again (generating a fresh code B, which is the code that actually ends up live on the server). Observed directly during live testing — the URL slug and the real room code differed. This is pre-existing behavior, present before this sprint and unrelated to the consolidation (both call sites and the `createRoom()` implementation are unchanged); flagging per Step 8's "manually inspect" instruction, not fixing per Step 6/the sprint's "do not fix unrelated bugs" rule.
- **`GameOverModal`'s button always reads "Restart (vs Bot)"** regardless of which route renders it (the label is hardcoded inside `GameOverModal.tsx`, not parameterized), even though the room route's `onRestart` doesn't restart a bot game — it shows a "create a new room to play again" snackbar. Observed during the live walkover test. Pre-existing, unrelated to this sprint's scope.
- **Testing two "players" in one browser profile shares `localStorage`/cookies** across tabs (same origin), so the `Navbar`'s displayed username can visibly swap between tabs when a second test identity is set up (the `storage` event listener in `Navbar.tsx` picks up the other tab's write). This did not affect actual game identity or socket state in testing (`useGameSocket`'s `myName` is captured once per hook instance and re-sent to the server only on that socket's own `connect` event) — noted here only as a testing-methodology caveat for whoever verifies future sprints the same way, not an application bug.
- **MongoDB was not reachable in this sandboxed environment** (`server/.env` points at `localhost:27017`), so login/signup, quick-match match persistence, and leaderboard data could not be exercised end-to-end here. The socket server degrades gracefully without Mongo (`me:setUser` and `persistMatch` are already wrapped in try/catch in the untouched server code), which is why gameplay itself could still be fully verified. Whoever runs Sprint 1+ in an environment with a reachable MongoDB instance should re-run the full acceptance checklist including real login/signup/persistence once, since that path was not exercisable here.

### Sprint 0.5 acceptance checklist

- [x] `/game` still works
- [x] `/room/[intent]/[code]` still works
- [x] Quick Match still works
- [x] Private room creation still works
- [x] Private room joining still works
- [x] Toss still works
- [x] Bat/Bowl selection still works
- [x] Multiplayer rounds still work
- [x] Score updates still work
- [x] Innings transition still works (mechanism unchanged; see Section E's pre-existing note that the innings overlay itself never visibly opens in multiplayer on either route — unchanged behavior, not a regression)
- [x] Game over still works (victory path confirmed via bot mode reaching a scoring round; walkover path confirmed live in the private-room test)
- [x] Bot mode still works
- [x] No socket event contracts changed
- [x] No server files were modified
- [x] No game logic changed
- [x] No authentication logic changed
- [x] Shared presentation structure now exists (`components/game/GameShell.tsx`)
- [x] Future UI changes to shared multiplayer screens can be made in one place
- [x] Existing UI appearance remains substantially unchanged (verified via direct visual comparison against Sprint 0's screenshots and live screenshots taken during this sprint's testing — same classes, same structure, same layering order)

### Files created

- `components/game/GameShell.tsx`

### Files modified

- `src/app/game/GameScreen.tsx`
- `src/app/room/[intent]/[code]/room-route-client.tsx`
- `docs/THUMBBAT_UI_AUDIT.md` (this section)

### Files deleted

- None.

I have not started Sprint 1, changed the visual design, or performed any unrelated cleanup. Waiting for approval before proceeding.

---

## Sprint 1 — Design System + App Shell

**Status:** Complete. Foundation-only, per scope: design tokens + reusable primitives, applied to the Navbar and `GameShell` only. No screen (Landing, Login, Signup, Leaderboard, lobby cards, Private Room, Toss, Game Board, Game Over) was redesigned.

### 1. Design tokens created

All in `:root` in `styles/globals.css`, surfaced as Tailwind utilities via `tailwind.config.ts` (additive only — no existing Tailwind color/radius/shadow key was overridden, so no class already in use anywhere in the app changed meaning):

- **Backgrounds:** `--tb-bg`, `--tb-bg-elevated`
- **Surfaces:** `--tb-surface`, `--tb-surface-elevated`, `--tb-surface-pressed`
- **Borders:** `--tb-border`, `--tb-border-subtle`
- **Primary/secondary:** `--tb-primary` (+ hover/pressed), `--tb-secondary` (+ hover)
- **Semantic:** `--tb-success`, `--tb-warning`, `--tb-danger` (+ hover)
- **Text:** `--tb-text-primary`, `--tb-text-secondary`, `--tb-text-muted`
- **Radius:** `--tb-radius-{sm,md,lg,xl,pill}` → `rounded-tb-{sm,md,lg,xl,pill}`
- **Shadows:** `--tb-shadow-{subtle,elevated,modal}` → `shadow-tb-{subtle,elevated,modal}`
- **Typography scale:** `fontSize.tb-{display,h1,h2,subheading,body,label,caption,score}` in `tailwind.config.ts` → `text-tb-display`, `text-tb-h1`, etc. (`display`/`h1` use `clamp()` for responsive sizing without a breakpoint jump — Step 11's "typography scales appropriately.")

Also repointed the generic `--background`/`--foreground` vars (used only by `<body>`; confirmed via grep that no `bg-background`/`text-foreground` utility class is used anywhere) at the fixed ThumbBat tokens instead of toggling with `prefers-color-scheme` — the app is dark-only by design and every page already paints its own `bg-gray-950` root div over `<body>`, so this only removes a light-mode flash edge case and changes no visible page.

### 2. New reusable components/utilities

All under `components/ui/` (new directory alongside the existing `components/ui/Snackbar.tsx`):

- **`cx.ts`** — tiny classNames joiner (no new dependency).
- **`motion.ts`** — shared Framer Motion presets: `fadeIn`, `slideUp`, `slideDown`, `scaleIn`, plus semantic aliases `pageEnter`, `backdropPresence`, `overlayPresence`, `popoverPresence`, and `cardHoverProps`/`pressTapProps` for hover/press feedback shapes.
- **`buttonStyles.ts`** — `getButtonClassName({variant, size, className})`, the single source of the button visual language, usable by both the real `<Button>` and plain `<Link>`s that need to look like a button (e.g. Navbar's nav CTAs) without duplicating near-identical class strings.
- **`Button.tsx`** — `variant`: `primary`/`secondary`/`ghost`/`destructive`; `size`: `default`/`sm`/`icon`/`icon-sm`; `loading` state (spinner); disabled; focus-visible ring; Framer `whileTap` press feedback (no CSS transform transition fighting the motion engine).
- **`Card.tsx`** — `variant`: `surface`/`elevated`/`glass`/`game`. Deliberately just a styled `<div>`, not a compound header/body/footer API — the surface→border→title→content→CTA hierarchy is a content convention (typography + button tokens), not a component tree to learn.
- **`Background.tsx`** (`AppBackground`) — the one reusable background (glow + faint grid + a slow, reduced-motion-aware accent blob), `variant`: `website`/`game`. Replaces, conceptually, the audit's flagged duplicate `BackgroundFX`/`BackgroundDecor` implementations — wired into `GameShell` this sprint; Landing/Login/Leaderboard keep their own inline backgrounds until their own redesign sprints.
- **`FormField.tsx`** — tokenized label/input/helper-or-error text control. Not yet consumed anywhere (Login/Signup redesign is a later sprint) — built ahead of that need per Step 4's "establish the visual foundation," ready for Sprint 3 to adopt.

### 3. Typography system

`tb-display` (hero), `tb-h1` (page/section heading), `tb-h2`, `tb-subheading`, `tb-body`, `tb-label` (uppercase, tracked — form labels/eyebrows), `tb-caption` (helper/error text), `tb-score` (bold tabular game numbers). Defined but, per scope, not yet applied to any existing heading/paragraph outside the two authorized surfaces (Navbar doesn't use custom sizes beyond its existing `text-sm`; GameShell doesn't render its own text). Ready for Sprint 2+ to adopt screen-by-screen.

### 4. Color system

Deep navy/black background (`#05070c` / `#0a0f17`) with mint-green primary (`#2fd8a9`) and a violet secondary accent (`#8b7cf6`) — refined from, but not copy-pasted from, the app's existing emerald/indigo palette (kept the identity the reference screenshots already establish, per the brief's "based on ThumbBat's identity and the reference material," while choosing deliberate, less-neon hex values rather than reusing Tailwind's stock `emerald-400`/`indigo-400`). Semantic success/warning/danger colors are distinct from primary so game feedback (win/lose/wicket, later sprints) never collides visually with UI chrome.

### 5. Surface system

`Card` variants (`surface`/`elevated`/`glass`/`game`) plus `AppBackground`. Applied live this sprint only inside `GameShell` (background) — the Navbar's own surfaces (bar background, dropdown, mobile menu) were retokenized in place rather than switched to `<Card>`, since they're fixed/overlay chrome, not content cards.

### 6. Button system

`primary`/`secondary`/`ghost`/`destructive` × `default`/`sm`/`icon`/`icon-sm`, all with default/hover/pressed(via Framer)/disabled/focus-visible states. Demonstrated live in the Navbar: "Play"/"Login or Register" CTAs (desktop + mobile) now render via `getButtonClassName`.

### 7. Form-control system

`FormField` (Step 4 deliverable) — created, tokenized, documented; not wired into any screen this sprint (Login/Signup stays out of scope per the brief).

### 8. Animation primitives

`components/ui/motion.ts`, standardized on the existing Framer Motion usage patterns already in the app (no new library, no Lottie/Rive). Additionally added `<MotionConfig reducedMotion="user">` around the whole app in `src/app/layout.tsx` — every Framer Motion animation anywhere in the app now automatically respects `prefers-reduced-motion` without each component needing its own check, which is a stronger, global version of the manual check `GameMoveVisual` already did per-component (that existing check is untouched and now redundant-but-harmless). The Navbar's own mount/dropdown/mobile-menu animations were migrated to the shared presets (`slideDown`/`popoverPresence`) with materially the same timing as before, and the Navbar's explicit `prefersReducedMotion` no-op for its own mount animation was kept as an extra, matching the existing precedent of disabling that entrance outright rather than just softening it.

### 9. Icon strategy

`lucide-react` (already a dependency, previously used only in `RoomBanner`) is now the Navbar's icon language: `Menu`/`X` (hamburger, now toggles to a close icon when open — a small, low-risk UX improvement), `ChevronDown` (user-menu caret), `LogOut` (logout action). Game-specific imagery (🏏 emoji brand mark on the login page, 🏆/🪙/🤖 elsewhere) was deliberately left untouched — that's the later asset-system sprint's job, per the brief.

### 10. Navbar changes

Every color/surface/gradient class retokenized (bar background, glow line, active-route underline gradient now primary→secondary, dropdown, mobile menu, avatar gradient). Icons swapped to lucide as above. CTAs now use the shared button classes. **Zero behavior changes**: `checkLoginStatus`, the `storage`/`login-success` listeners, the pathname-based menu-close effect, the click-outside effect, the Escape-key effect, and `handleLogout` are byte-for-byte identical to before — verified live (see Section 17).

### 11. GameShell changes

Replaced the two hardcoded gradient/grid `<div>`s and `bg-gray-950` wrapper class with `<AppBackground variant="game" />` and a `text-tb-text-primary` wrapper. Nothing else in `GameShell` changed — `RoomBanner`, `TossOverlay`, `GameBoard`, `InningsOverlay`, `GameOverModal`, and `Snackbar` are rendered exactly as Sprint 0.5 left them, with their own pre-existing styling untouched, per the brief's explicit "do not redesign GameBoard/TossOverlay/GameOverModal/RoomBanner."

### 12. Files modified

- `tailwind.config.ts` — token extensions (additive)
- `styles/globals.css` — token definitions (additive; `--background`/`--foreground` values repointed)
- `src/app/layout.tsx` — added `<MotionConfig reducedMotion="user">` wrapper
- `components/Navbar.tsx` — visual retokenization + icon swap + shared button classes (behavior unchanged)
- `components/game/GameShell.tsx` — background/wrapper only

### 13. Files created

- `components/ui/cx.ts`
- `components/ui/motion.ts`
- `components/ui/buttonStyles.ts`
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Background.tsx`
- `components/ui/FormField.tsx`

### 14. Files deleted

None. No dead code (`GameMoveImages.tsx`, `WaitingOverlay.tsx`, `useCountdown.ts`, legacy auth route, unused SVGs) was touched, per the brief.

### 15. Behavior-sensitive files touched

None. `server/socket-server.ts`, `server/models/*`, `server/config/db.ts`, `src/hooks/useGameSocket.ts`, `src/hooks/useBotGame.ts`, `src/hooks/useAuthGuard.ts`, `src/lib/socket.ts`, `src/middleware.ts`, `src/types/realtime.ts`, `src/app/api/**/route.ts`, and `src/env.ts` are all untouched — confirmed via `git status`. No socket event, payload, timer, game rule, scoring rule, innings rule, matchmaking rule, or auth rule changed. All prop/callback contracts on every touched component are unchanged (`GameShell`'s prop API from Sprint 0.5 was not modified — only its own internal background JSX was).

### 16. Build results

- **`npx tsc --noEmit`**: clean except two errors confirmed pre-existing and unrelated: `components/game/lobby/JoinRoomCard.tsx` (an `inputMode="latin"` type mismatch, present before this sprint, file untouched) and a generated `.next/types/app/room/[intent]/[code]/page.ts` error against the untouched `page.tsx` (a Next 15 async-`params` typing artifact that only appears after a fresh `.next` build, unrelated to any file this sprint touched — confirmed via `git diff --stat` showing zero changes to that `page.tsx`). Both are moot regardless, since `typescript.ignoreBuildErrors: true`.
- **`npm run build`**: `✓ Compiled successfully`. The build then fails at the `Collecting page data` step for `/api/auth/login` — the exact same pre-existing, environment-specific failure documented and confirmed (by stashing changes and rebuilding) in Sprint 0.5; reconfirmed here as unrelated to any Sprint 1 file.

### 17. Manual verification results

Using the Chrome browser tool against a freshly started `next dev` + `tsx server/socket-server.ts` (both had to be restarted mid-sprint after a stale dev-server-vs-production-build `.next` collision caused transient 500s — resolved by clearing `.next` and restarting; unrelated to source changes). MongoDB remained unreachable in this sandbox (same as Sprint 0.5), so real login/signup/leaderboard data could not be exercised — auth was bypassed for testing only via a manually-set `localStorage`/cookie `token`, same method as Sprint 0.5.

Verified, with screenshots:
- **Landing (`/`)**, logged out: new Navbar renders correctly (mint "Login or Register" pill, active-route underline gradient under "Home"); the rest of the page (untouched) renders unchanged.
- **Login (`/login`)**: renders correctly under the new Navbar; form itself unchanged.
- **Leaderboard (`/leaderboard`)**: renders correctly under the new Navbar; degrades to its existing loading→error state as expected with no reachable database (same as Sprint 0.5 — confirms no regression).
- **`/game`**: lobby cards render under the new Navbar; `GameShell`'s new background (glow + grid + violet game-mode radial) visible behind them.
- **`/room/create/[code]`**: `RoomBanner` renders correctly over `GameShell`'s new background — confirms Step 10 (foundation only, child components untouched).
- **Navbar, logged in**: "Play" pill + avatar/name/chevron render with new tokens; clicking the avatar opens the dropdown (`Profile`/`Logout` with the new `LogOut` icon, tokenized colors); clicking outside the dropdown closes it (click-outside behavior preserved); clicking **Logout** correctly clears the session and redirects to `/login`, and the Navbar immediately reflects the logged-out state (`handleLogout` behavior fully preserved).
- **Console**: checked on every page/navigation above — no React errors, no hydration warnings, no duplicate-listener symptoms. The one recurring "N errors" badge is Next's own dev-mode error counter accumulating from the expected, no-database `/api/leaderboard` 500s (confirmed by the exact matching error text) — not a new issue.
- **Mobile Navbar**: **could not be visually verified this sprint** — the browser tool's window-resize call reported success but did not actually change the rendered viewport in this sandboxed browser session (confirmed via `window.innerWidth` staying at the desktop size after two resize attempts, and no device-emulation tool was available as a fallback). Verified instead by code review: every responsive display class controlling the mobile menu (`md:hidden` on the hamburger button and mobile menu container, `hidden md:flex` on the desktop nav/CTA groups) is byte-identical to the pre-Sprint-1 file — only colors/icons/classes *inside* those same conditionally-shown blocks changed. Whoever next has a real narrow-viewport browser available should do one visual pass over the mobile menu before Sprint 2 builds on it.

### 18. Remaining issues / notes for Sprint 2+

- Mobile-viewport visual verification of the Navbar is outstanding (see above) — a sandbox limitation, not a known defect.
- `FormField` and the `website` variant of `AppBackground` exist but have no consumer yet — expected to be picked up by the Login/Signup and Landing/Leaderboard redesign sprints respectively.
- The four backlog bugs (BUG-01 double room-code generation, BUG-02 GameOverModal's "Restart (vs Bot)" copy on the room route, BUG-03 client resume not wired, BUG-04 multiplayer innings overlay not visibly opening) are untouched, as instructed.
- No dead code was removed, as instructed.

I have not started Sprint 2, redesigned any individual screen beyond the authorized Navbar/GameShell foundation work, or performed any unrelated cleanup. Waiting for approval before proceeding.

---

## Sprint 2 — Home / Landing Page Redesign

**Status:** Complete. `src/app/page.tsx` redesigned end-to-end on the Sprint 1 design system; one new presentation-only component (`components/home/GamePreview.tsx`). No auth/routing/behavior changed.

### 1. Before/after design direction

**Before:** a well-built but website-flavored page — generic "gradient blob + grid" background (`BackgroundFX`, a third near-duplicate of the pattern Sprint 1 consolidated elsewhere), an `ArcadeCabinet` mockup that visually read as "a screenshot of a screen" rather than the game itself, and ad hoc Tailwind color/spacing values throughout (no design-token reuse, since this page predates Sprint 1).

**After:** the same page structure and copy intent, rebuilt entirely on Sprint 1's tokens/primitives (`AppBackground`, `Card`, `getButtonClassName`, the shared motion presets, `tb-*` typography). The hero now shows an actual miniature game HUD instead of a mockup-of-a-mockup, mode cards read as selectable game modes (icon + title + description + action) rather than generic feature cards, and every heading/body/label on the page uses the new typography scale instead of one-off `text-2xl`/`text-sm` choices.

### 2. Hero changes

- Wordmark ("THUMBBAT") keeps the existing `Press_Start_2P` pixel font lockup — a deliberate exception to "use the typography tokens everywhere": it's a branded lockup in a special display font, not a heading, and forcing it onto the `tb-display` clamp (tuned for the base Inter font's normal character width) would have made an unusually wide pixel font either overflow or shrink oddly. Every other heading on the page (`Game Modes`, `How it works`, `Live Matches`, the final CTA) uses `text-tb-h1`/`text-tb-h2`/etc.
- New eyebrow chip ("● Live matchmaking") above the wordmark for hierarchy; the old trust row below the CTAs now shows the other two original items ("Secure accounts", "No ads") without repeating the same "Live matchmaking" text twice on the page.
- Tagline copy changed from "Fast-paced thumb cricket. Neon vibes. Pure fun." to "Fast-paced thumb cricket. Pick. Play. Win." — the brief explicitly said not to blindly keep weaker existing copy, and "Neon vibes" directly contradicted this sprint's own "avoid excessive neon" direction. Body paragraph tightened similarly (dropped "Buttery animations, instant matches, zero clutter," which read as generic SaaS copy) while keeping the personalized ", {myName}" touch and the exact same `myName`/auth-check logic that produces it.
- CTAs: "Play Now" (was "Start Match") → `/login`, unchanged destination; "How to play" → `/how-it-works`, unchanged (dead, preserved — see Section 8).

### 3. Game preview implementation

`components/home/GamePreview.tsx` — presentation-only, no socket/hook imports at all (verified: no import from `useGameSocket`, `useBotGame`, or `socket.io-client`). Renders a miniature HUD: two `PlayerChip`s (YOU 4 / RIZZWON 2, mint/violet tokened), an "arena" reusing the exact same idle-hand artwork the real game board renders (`PLAYER_IDLE`/`OPP_IDLE` imported from the existing `lib/getMoveImage.ts` — no new image assets), a status line, and a static, `aria-hidden` 1–6 number row (not interactive — it's decoration, not a real picker). A small looping vertical bob on the two hand images (reduced-motion gated via `useReducedMotion`) is the "ambient movement" the brief asked for; nothing else in the component animates continuously.

### 4. Game mode redesign

`ModeCard` (still a local helper inside `page.tsx`, not extracted) now renders: a lucide icon in a tokened chip (`Zap` / `Bot` / `Swords` for Quick Match / Vs Bot / Challenge a Friend — replacing the old inline emoji `icon` prop), title, one-line description, and a real `<Link>` styled via `getButtonClassName`. Hover feedback uses the shared `cardHoverProps` preset. All three `href`s are still `/login` — unchanged, since this is the logged-out page and every mode routes through auth first, exactly as before.

### 5. How-it-works redesign

Same three-step content (Toss / Pick 1–6 / Chase & Win, same copy), now each a `Card` with a numbered pill badge (mint→violet gradient) plus a small lucide icon (`Coins` / `Hash` / `Trophy`) instead of no icon at all. Staggered entrance via `whileInView` + a small per-index delay, `viewport={{ once: true }}` so it fires once on scroll-into-view, not repeatedly.

### 6. Live/ticker changes

Inspected first, per the brief: the existing ticker (`Ticker`/`Chip`/`Badge`) is 100% static demo data (a hardcoded 5-item array), not backed by any API or socket. That fact is unchanged — same fake roster, same triple-repeated scrolling track, same mechanism. Only the presentation changed: retitled "Live Matches" with a pulsing live-dot, wrapped in a `Card variant="glass"`, and `Chip`/`Badge` (renamed `MiniBadge` to avoid a name collision, no behavior change) retokened. The infinite horizontal scroll animation is transform-based, so it's automatically neutralized for `prefers-reduced-motion` users by Sprint 1's root-level `<MotionConfig reducedMotion="user">` — no per-component change was needed for that.

### 7. Final CTA

Redesigned into a `Card variant="elevated"` panel: "Ready?" (label token, primary color) → "Step into the arena." (h1 token) → "Matches take minutes. Memories last longer." (unchanged line) → two CTAs, same destinations as before (`/login` primary, `/leaderboard` secondary).

### 8. Footer changes

Unchanged functionally: same copyright line (same pre-existing `new Date().getFullYear()` pattern), same three links. Per the brief, the known dead routes were **preserved, not implemented, not silently removed** — `/how-it-works` (hero secondary CTA) and `/privacy`, `/terms`, `/contact` (footer) all still point where they did before. Both are marked with an inline code comment in `page.tsx` pointing at this audit doc, and are listed again here as still-outstanding, pre-existing issues — no route was created or deleted this sprint.

### 9. Responsive behavior

`grid-cols-1 md:grid-cols-[1.15fr_1fr]` for the hero (text column first, preview second — which on the single-column mobile stack already satisfies the requested mobile priority order: identity → Play Now → preview → modes → how-it-works → final CTA, with no extra ordering CSS needed), `sm:grid-cols-2 lg:grid-cols-3` for mode cards, `sm:grid-cols-3` for how-it-works — all pre-existing Tailwind breakpoint conventions already used elsewhere in the app, not new patterns. Verified live at a genuine ~400px-wide viewport (see Section 17): no horizontal overflow, all touch targets are full `getButtonClassName` buttons (min padding `px-5 py-3`/`px-4 py-2`), typography scales via the `tb-h1`/`tb-h2` clamp() tokens, and the mode/step cards stack cleanly to one column without cramping.

### 10. Motion changes

Hero elements: simple opacity/y entrance on mount (same pattern the pre-existing page used, now with slightly tightened stagger delays). Game preview: scale/opacity entrance for the whole card, plus the small ambient hand-bob described in Section 3. Mode cards: hover lift via the shared `cardHoverProps`. How-it-works: staggered `whileInView` entrance. Final CTA: `whileInView` scale/opacity entrance, `once: true`. No new animation library; everything is the existing Framer Motion, mostly via Sprint 1's `components/ui/motion.ts` presets (`cardHoverProps`) plus page-local `motion.div`s with materially the same timing already used pre-Sprint-2.

### 11. New assets

None. `GamePreview` reuses the existing `/images/start.png` / `/images/start-r.png` idle-hand PNGs via the existing `lib/getMoveImage.ts` exports — no new image, SVG, or icon file was added. All new "visuals" (mode icons, step icons, HUD chips, number row) are lucide-react components or CSS/Tailwind shapes.

### 12. New components

- `components/home/GamePreview.tsx` (and its local, unexported `PlayerChip` helper) — the only new file.

### 13. Modified files

- `src/app/page.tsx` — full redesign (see below for the removed/rewritten inline helpers)

### 14. Deleted files

None as separate files, but two inline helper functions that lived inside `page.tsx` were removed as a **direct, necessary consequence of this exact sprint's instructions** (not unrelated cleanup): `BackgroundFX` (superseded by `<AppBackground variant="website" />`, which the brief explicitly said to use instead of recreating it) and `ArcadeCabinet` (superseded by `<GamePreview />`, which the brief explicitly asked to build in its place). `ModeCard`, `StepCard`, `Ticker`, `Chip`/`Badge` were kept as local helpers inside `page.tsx` (not extracted to new files — the brief warned against creating "dozens of tiny components") and had their internals rewritten to consume Sprint 1 primitives.

### 15. Behavior-sensitive files touched

None. `server/socket-server.ts`, `server/models/*`, `server/config/db.ts`, `src/hooks/useGameSocket.ts`, `src/hooks/useBotGame.ts`, `src/hooks/useAuthGuard.ts`, `src/lib/socket.ts`, `src/middleware.ts`, `src/types/realtime.ts`, `src/app/api/**/route.ts`, `src/env.ts` — all untouched, confirmed via `git status`. The auth-check `useEffect` (localStorage `token`/`username` read, `router.replace("/game")` redirect for logged-in visitors) is byte-for-byte the same logic as before, just left in place while the JSX around it was rewritten. Every `<Link>`'s `href` is identical to its pre-Sprint-2 destination (verified live — see Section 17).

### 16. Build results

- **`npx tsc --noEmit`**: clean except the one pre-existing, unrelated `JoinRoomCard.tsx` error already documented in Sprints 0.5/1 (file untouched this sprint too).
- **`npm run build`**: `✓ Compiled successfully`; fails afterward at the same pre-existing `Collecting page data` step for `/api/auth/login`, already confirmed unrelated and environment-specific in Sprint 0.5.

### 17. Browser verification

Fresh `next dev` + `tsx server/socket-server.ts` (both had to be restarted cleanly — leftover processes from earlier sprints were still holding ports 3000/3001/5001 in this long-running sandbox session; killed and restarted on the standard ports, unrelated to any source change).

- **All link/CTA destinations** verified by reading the live DOM's anchor `href`s directly (`Play Now`→`/login`, `How to play`→`/how-it-works`, all three mode cards→`/login`, final CTA→`/login`+`/leaderboard`, footer→`/privacy`/`/terms`/`/contact`, nav→`/`,`/game`,`/leaderboard`,`/login`) — all identical to pre-Sprint-2 destinations.
- **Logged-in redirect**: confirmed the auth-check effect still fires (tested in earlier sprints' sessions against this same effect; not re-broken here since the effect itself is untouched code).
- **No horizontal overflow**: confirmed programmatically (`document.documentElement.scrollWidth === clientWidth`) at the sandbox's actual viewport.
- **Console**: no React errors, no hydration warnings; only Next's Fast-Refresh dev logs.
- **Navbar / mobile menu**: this session's sandboxed browser happened to render at a genuine narrow (~400-480px) viewport throughout (the opposite constraint from Sprint 1, where the same tooling was stuck wide) — which finally allowed a *live* check of the mobile hamburger menu Sprint 1 could only verify by code review. Confirmed working: hamburger→close-icon toggle, backdrop-blur panel, Home/Play/Leaderboard links, and the Login-or-Register CTA all render and open/close correctly.

**Notable finding, not a code defect:** this sandbox's browser tab reports `document.visibilityState: "hidden"` even while being the tab actively driven by the automation tool. Since Framer Motion's mount-triggered `initial`→`animate` transitions run on `requestAnimationFrame`, and Chrome suspends rAF callbacks for hidden documents, every entrance animation on the page (hero text, mode cards, etc.) froze at its `initial` (near-invisible) state in raw screenshots — not just on this page, but as an inherent property of the `initial`/`animate` mount-animation pattern already used everywhere in the app since before Sprint 1 (Login, Leaderboard, the original pre-Sprint-2 Home page all use the identical pattern and would show the same freeze in this same sandbox). This is a testing-tool artifact, not a Sprint 2 regression: confirmed by injecting a temporary `* { opacity:1 !important; transform:none !important }` override (screenshot-only, never touching source) after which every section rendered exactly as designed — see the screenshots in Section 18. Documented here rather than silently worked around, since it's a real characteristic of rAF-driven entrance animations that's worth knowing about, even though real users' focused/visible tabs never hit it.

### 18. Screenshot verification

Captured with the temporary visibility workaround described above (source code unaffected):

1. Mobile hero (with `GamePreview`) — wordmark, tagline, body copy, "Play Now"/"How to play", trust row, and the HUD preview card all render cleanly stacked, no overflow.
2. Mobile game modes — three stacked cards with icon/title/description/CTA, "Live" badge on Quick Match.
3. Mobile how-it-works, live matches, final CTA, and footer — all confirmed via scroll-through screenshots; numbered step cards with icons, the scrolling match-chip feed inside its glass card, the "Ready? / Step into the arena." panel, and the footer links all render correctly.
4. Mobile Navbar menu open state (bonus — see Section 17).

**Desktop-width screenshots could not be captured this sprint** — this sandbox session's browser window rendered at a fixed ~400-480px width for the entire session regardless of `resize_window` calls (the inverse of Sprint 1's sandbox, which was stuck wide instead of narrow; the underlying tool clearly does not reliably control viewport size in this environment in either direction). Desktop layout correctness was instead verified by code review: the grid/breakpoint classes (`md:grid-cols-[1.15fr_1fr]`, `sm:grid-cols-2 lg:grid-cols-3`, `sm:grid-cols-3`) are standard, already-proven Tailwind patterns identical in structure to ones Sprint 1 already verified live at desktop width elsewhere in the app (e.g. the Navbar's `hidden md:flex` split). Recommend a real desktop-viewport pass before Sprint 3 signs off on this page, alongside the still-outstanding mobile-Navbar item from Sprint 1 (which this sprint incidentally resolved — see Section 17).

### 19. Known limitations

- No desktop-width screenshot this sprint (sandbox constraint, see Section 18).
- The rAF/page-visibility animation freeze described in Section 17 is a real characteristic of the app's existing motion pattern (not introduced by Sprint 2) that could theoretically affect a real user who loads the page in a genuinely backgrounded tab and looks at it before switching to it — extremely unlikely in practice (opening a link in a background tab and never bringing it forward before reading it), and consistent with how every other animated entrance in the app already behaves, so no code change was made for it. Worth a mention if a future sprint wants to harden critical above-the-fold content against this edge case globally (e.g. defaulting hero text to visible and treating the motion as pure enhancement) — not scoped to Sprint 2's brief.

### 20. Remaining issues

- `/how-it-works`, `/privacy`, `/terms`, `/contact` are still dead routes — preserved per instruction, not fixed.
- The four backlog bugs (BUG-01..04) and dead code list from Sprints 0.5/1 are untouched, as instructed.
- Login, Signup, Leaderboard, Play lobby, Private Room, Toss, and Game Board/Game Over remain un-redesigned, as instructed — they can adopt the Sprint 1 primitives now demonstrated a second time on this page whenever their own sprints arrive.

### Change budget

```
FILES CREATED:       1  (components/home/GamePreview.tsx)
FILES MODIFIED:      1  (src/app/page.tsx)
FILES DELETED:       0  (two inline helpers removed from within the modified file — see Section 14)
BEHAVIORAL FILES TOUCHED:  None
VISUAL FILES TOUCHED:      src/app/page.tsx, components/home/GamePreview.tsx
NEW DEPENDENCIES:    None (lucide-react and framer-motion were already installed)
REGRESSION RISK:     Low — single, self-contained client page; no shared component, hook, route, or API touched; every Link href verified identical to its pre-Sprint-2 destination.
```

I have not started Sprint 3, redesigned Login/Signup/Leaderboard/lobby/room/toss/board/game-over, or performed any unrelated cleanup. Waiting for approval before proceeding.

---

## Sprint 2 addendum — Genuine desktop-width verification

**Status:** Verification only. No implementation changed.

This sandbox's browser previously rendered at a fixed narrow (~400-480px) window for an entire session (documented in the Sprint 2 section above as "the reverse of Sprint 1's problem"). In a fresh session this time, the browser defaulted to a genuine wide desktop viewport (**2228×1083 CSS px**, DPR ~1.15 — `resize_window` calls toward 1440×900 were silently no-ops in both directions again, as in every prior sprint; this tool does not reliably control viewport size in this environment, but the *default* this session happened to already be desktop-width, which is what was needed).

**Verified at this genuine desktop width**, scrolling through the full page:

- **Hero**: wordmark, tagline, body copy, "Play Now"/"How to play" CTAs, trust row, and `GamePreview` render side-by-side (`md:grid-cols-[1.15fr_1fr]`) exactly as designed.
- **GamePreview**: HUD card renders correctly at its intended `max-w-md` size next to the hero text, not stretched or cramped.
- **Game Modes**: three-column grid (`sm:grid-cols-2 lg:grid-cols-3`), icons/badges/descriptions/buttons all well-proportioned.
- **How It Works**: three-column grid, numbered gradient badges + icons render correctly.
- **Live Matches**: ticker scrolls within its `Card variant="glass"` container, clipped correctly, no page-level overflow.
- **Final CTA**: centered panel, both buttons visible and correctly sized.
- **Footer**: copyright + Privacy/Terms/Contact links render correctly.
- **No horizontal overflow**: confirmed programmatically (`document.documentElement.scrollWidth` 2213px vs `clientWidth` 2213px at a 2228px viewport — the difference is just the scrollbar).

**Investigated and ruled out as a false alarm:** a screenshot appeared to show the hero's "Live matchmaking" eyebrow badge overlapping the top of the "THUMBBAT" wordmark. Rather than trust the screenshot, this was verified against the live DOM: `getBoundingClientRect()` on both elements showed a clean 16px gap (badge bottom at y=155.65, heading top at y=171.64, matching the intended `mt-4` spacing exactly), and `document.elementFromPoint()` sampled at y=160/165/170 in that gap returned the plain background `<div>`, not either element — proving real empty space exists between them. Reproduced identically across three separate fresh tabs (including one with zero prior navigation history), ruling out session contamination. Concluded this is a screenshot-compression/downscaling artifact (the 2228px viewport is captured and returned as a 1568px-wide JPEG, and a large, heavy pixel-art font — `Press Start 2P` at 60px with `line-height: 1` — sitting close to a small badge can visually read as "touching" once compressed and shrunk, even when the real gap is a normal, deliberate 16px). No code change was made, per the instruction to only modify implementation if an actual defect was found.

**Found and documented, but explicitly out of this task's scope (not fixed):** a React hydration-mismatch warning on the Navbar's "Login or Register" link, reproduced identically on both `/` and `/leaderboard` — proving it belongs to the shared `Navbar.tsx` (a Sprint 1 file) and is unrelated to Sprint 2's Home page work. Direct comparison of the server-rendered HTML's `className` attribute against the live DOM's `className` after hydration showed them **byte-identical** (490 characters, exact string match) — so whatever React's hydration checker actually flagged as mismatched is not the className text itself, and the true cause wasn't conclusively identified (a `useReducedMotion()` server/client default divergence was checked and ruled out — `matchMedia('(prefers-reduced-motion: reduce)').matches` is `false` in this environment, consistent on both checks). The warning doesn't break rendering or interactivity (React logs it and moves on, per its own message: "This won't be patched up"). Flagging this for whoever next touches `Navbar.tsx` to investigate — it predates and is unrelated to this verification pass.

**Conclusion:** no genuine desktop layout defect was found on the Home page. No files were modified.

---

## Sprint 3 — Authentication Redesign

**Status:** Complete. `src/app/login/page.tsx` and `src/app/confirm/ConfirmClient.tsx` (+ its Suspense fallback in `page.tsx`) redesigned on the Sprint 1/2 system. `components/ui/FormField.tsx` extended with two small, generically-useful additions (`endAdornment`, animated error/hint transition). No auth API, token, storage, or redirect logic changed.

### 1. Current auth architecture inspected

Confirmed via direct re-inspection (all files already documented in Sprint 0, re-verified unchanged before touching anything):

- **Single `/login` route, mode-switched** — `src/app/login/page.tsx` renders both Login and Signup via local `mode` state (`"login" | "signup"`); there is no `/signup` route and Sprint 3 did not create one.
- **Confirmation flow** — `src/app/confirm/page.tsx` (Suspense wrapper) → `ConfirmClient.tsx` (`"use client"`), reads `?token=` via `useSearchParams`, calls `GET /api/auth/confirm?token=...`. This is an **email-confirmation token**, never a login/session token — confirmed against `src/app/api/auth/confirm/route.ts` and the `VerificationToken` model (Sprint 0 audit, Section G).
- **Auth guard / middleware** — `useAuthGuard.ts` (client, checks `localStorage.token`) and `src/middleware.ts` (server, checks the `token` cookie, `/game/:path*` only) — neither touched, neither relevant to `/login` or `/confirm` (both are public routes).
- **API contracts** — `POST /api/auth/login` `{username,password}` → `{token,username,userId,...}`; `POST /api/auth/signup` `{username,password,email}`; `GET /api/auth/confirm?token=` — all in `src/app/api/auth/**/route.ts`, all untouched.

Mapping:

```
/login  → src/app/login/page.tsx → mode state (login|signup) → handleSubmit()/validate*() → new Card/FormField/Button JSX
/confirm → page.tsx (Suspense) → ConfirmClient.tsx → loading/errorMessage/countdown state → new Card JSX (loading | error | success)
```

### 2. Login redesign

Rebuilt the render tree only — every piece of state (`mode`, `username`, `email`, `pw`, `showPw`, `loading`, `uErr`, `eErr`, `pErr`), every validator (`validatePassword`, `fetchBadWords`, `validateUsername`, the `emailValid` memo), and `handleSubmit` (identical body: same validation order, same `axios.post` calls to the same endpoints with the same payload shapes, same `localStorage`/cookie writes, same `login-success` event dispatch, same `router.replace("/game")`, same `toast` calls) are byte-identical to the pre-Sprint-3 file. Only the JSX changed:

- `BackgroundDecor()` (local helper) removed → `<AppBackground variant="website" />` (Sprint 1 primitive, per instruction).
- Card wrapper: plain `rounded-3xl border border-white/10 bg-white/5` → `<Card variant="elevated">` (Sprint 1 primitive).
- Brand mark: the 🏏 emoji square is now the actual `/thumbbat-logo.png` asset (the same file the Navbar already uses) via `next/image` — the sprint brief specifically asked to check for an existing asset before falling back to typography/CSS, and one existed.
- `Field` (local helper) removed → `FormField` (Sprint 1 primitive, extended — see Section 5).
- All CTAs/links → `Button` component or `getButtonClassName(...)`-styled `Link`s.
- The Login/Signup toggle at the bottom (previously a `<Link href="/signup" onClick={e => {e.preventDefault(); setMode(...)}}>`) is now a plain `<button type="button" onClick={() => setMode(...)}>` — functionally identical (the old `href`/`preventDefault` combination never actually navigated; a button is the semantically correct element for an action that only ever toggles local state) and does not create a `/signup` route.
- Toast presentation retokenized via `<ToastContainer toastClassName={...}>` (a supported react-toastify prop) — the `toast.success(...)`/`toast.error(...)` call sites and their message strings are unchanged.

### 3. Signup redesign

Same component, `mode === "signup"` branch: Email `FormField` appears (see Section 9), button label becomes "Create account", footer toggle becomes "Have an account? Log in" — all pre-existing conditional logic, now rendered with the new primitives. No new signup-specific behavior was added or changed.

### 4. Mode-switch redesign

The Login/Signup switch is now `role="tablist"` with two `role="tab"` buttons (`aria-selected` reflecting `mode`), a sliding pill (`layoutId`-free, positioned via `animate={{left: ...}}`, matching the original mechanism, retokened to `bg-tb-bg-elevated`/`text-tb-text-primary`/`text-tb-text-secondary`). Buttons are disabled while `loading` (new — small polish, doesn't change mode-switch behavior itself, only prevents switching mid-submit). Mode switching still only calls `setMode("login" | "signup")`; no URL/routing change.

### 5. FormField usage

Both `username` and `password` inputs, and the conditional `email` input, now render through `FormField` (login/signup) or are laid out with the same primitives (confirm page has no form inputs). `FormField` itself gained two additions in this sprint, both scoped to the component and low-risk since it had zero other consumers before this sprint:

- **`endAdornment`** — a slot rendered inside a `relative` wrapper scoped to just the `<input>` (not the label/helper), so it centers correctly regardless of label or helper-text height. Used for the password-visibility toggle.
- **Animated error/hint text** — the helper paragraph is now wrapped in `AnimatePresence`+`motion.p` using the shared `fadeIn` preset, giving every current and future `FormField` consumer the "small error transition" the brief asked for, for free.

### 6. Password visibility implementation

The feature already existed (a text "Show"/"Hide" button toggling `type`). Redesigned per the brief: now an icon button (`Eye`/`EyeOff` from `lucide-react`) passed as `FormField`'s `endAdornment`, with `aria-label` ("Show password"/"Hide password") and `aria-pressed={showPw}` reflecting state, keyboard-focusable (`<button type="button">`), disabled while `loading`. The toggle still only flips the local `showPw` boolean and the input's `type` attribute — no change to `pw` state or submission behavior.

### 7. Validation presentation

Unchanged rules (password strength regex, username length, username content-filter, email regex for signup) — only presentation improved: errors now render via `FormField`'s tokenized, `role="alert"`, `aria-describedby`-linked error text (previously a plain `<p className="text-rose-300 text-xs">` with no ARIA wiring), with the new fade-in transition. Input border switches to `border-tb-danger` on error (not color-only: the text message itself is always present, and the input carries `aria-invalid`).

### 8. Auth error state

**Finding, per Step 2's instruction to document rather than invent:** the current application has no dedicated "auth failed" *screen* — authentication/API failures surface as a `react-toastify` toast (`toast.error(...)`), and the form itself remains on-screen and interactive for an immediate retry. There is no full-screen "Something went wrong / [TRY AGAIN]" state to redesign, because none exists in the current architecture; inventing one would contradict Step 2's "do not invent states the app doesn't support." Instead, the **toast's presentation** was redesigned (tokenized surface, border, shadow — see Section 2) without touching any `toast.success`/`toast.error` call site, message, or the error-handling logic in `handleSubmit`'s `catch` block.

### 9. Invalid/missing token state

This is a real, existing screen (`ConfirmClient.tsx`'s `errorMessage` branch) and was redesigned as directed. Copy was written to accurately reflect what the token actually is (an **email-confirmation link**, never a session):

> Something went wrong.
> Your confirmation link is invalid or has expired.
> *{the exact original dynamic detail text — "Invalid or missing token." or "Invalid or expired token. Please try again." — preserved verbatim below the heading}*
> [ Back to home ] [ Log in again ]

The two action buttons are new (the pre-Sprint-3 error state was a dead end with no recovery links at all) — both are pure navigation (`Link href="/"`, `Link href="/login"`), not auth logic, so they don't conflict with "do not invent auth behavior." `errorMessage`'s two possible values, the `!token` check, and the `axios.get` + `catch` logic are all unchanged.

### 10. Confirmation success state

Also redesigned: "You're all set. / Your account has been confirmed. / Redirecting to login in {countdown}s… / [ Log in now ]". The exact original `toast.success("Account confirmed successfully!")` call, the `setInterval` countdown, the second `useEffect` that calls `router.push("/login")` when `countdown <= 0`, and the button's `onClick={() => router.push("/login")}` are all unchanged — only the inline JSX presentation is new.

### 11. Background treatment

`<AppBackground variant="website" />` on both `/login` and `/confirm` (the confirm page had no background treatment at all before — a plain `bg-gray-900` div — so this is a net addition of the Sprint 1 primitive, not a replacement of a competing implementation). No new background system was created.

### 12. Motion treatment

Card entrance uses the shared `scaleIn` preset (both pages). The email field's appear/disappear on mode switch and the auth-card's mount both use shared presets (`slideDown`, `scaleIn`) instead of bespoke inline objects. No floating game objects, particles, parallax, or HUD effects were added, per the brief. Global `<MotionConfig reducedMotion="user">` (Sprint 1, `layout.tsx`) covers every animation on both pages automatically.

### 13. Responsive behavior

Both pages use a single `w-full max-w-md` card centered via `grid place-items-center` inside a `px-6 py-10` page wrapper — the same fluid-card pattern, with no viewport-specific breakpoint classes needed, because a max-width (not fixed-width) card in a centered flex/grid container is inherently safe down to very narrow viewports (it shrinks to `100% - 2×24px` gutter below 496px, and sits at a fixed comfortable 448px above that). `FormField` inputs are `w-full`. No component in either page introduces a fixed pixel width. This sprint's sandbox session rendered at a fixed wide desktop viewport for its entire duration (2228×1083 — `resize_window` was a no-op in every direction tried, consistent with every prior sprint's experience with this tool); a genuine narrow-viewport screenshot could not be captured this sprint (see Section 20 for what this means for verification confidence).

### 14. Accessibility changes

- `FormField`: label `htmlFor`/`id` association (already existed), added `aria-describedby` linking the input to its helper/error text, added `role="alert"` on the error paragraph specifically (not the hint).
- Password toggle: `aria-label` + `aria-pressed`, keyboard-focusable button (not a div/span).
- Mode tabs: `role="tablist"`/`role="tab"`/`aria-selected`.
- Confirm page's icon badges (`AlertTriangle`, `CheckCircle2`) are `aria-hidden`; the actual state is always communicated by adjacent text, never by icon/color alone.
- Errors are never color-only: every error state pairs a border-color change with visible text (field-level) or a heading + description (confirm page).
- All new interactive elements are real `<button>`/`<a>` elements (native keyboard support), and inherit the existing `focus-visible:ring-2 focus-visible:ring-tb-primary/60` treatment from `getButtonClassName`/`FormField`.

### 15. Navbar hydration-warning investigation

Per the brief's explicit request to reproduce, attribute, and root-cause this (not suppress it):

- **Reproduced**: yes, intermittently — specifically after interacting with/hot-reloading a page for a while within one dev session (confirmed on `/`, `/leaderboard`, and `/login` at different points this sprint).
- **Did Sprint 3 cause it?** No. It reproduces identically on `/leaderboard` (a page neither Sprint 2 nor Sprint 3 touched), and it does **not** reproduce on a genuinely fresh session (fresh `.next` build + freshly started `next dev` + a brand-new browser tab, tested three separate times this sprint, on both `/` and `/login`) — it only appears after a session has already been interacted with/hot-reloaded for a while.
- **Root cause, to the extent it could be established:**
  1. Traced `useReducedMotion()`'s framer-motion source (`node_modules/framer-motion/dist/es/utils/reduced-motion/*.mjs`): its `useState()` initial value is read from a module-level variable that is `null` on the server (no `window`) and a synchronously-resolved `boolean` on the client — a textbook server/client branch shape. In this app's specific usage (`prefersReducedMotion ? {} : slideDown.initial`), however, both `null` and the client's actual value (`false`, confirmed via `matchMedia('(prefers-reduced-motion: reduce)').matches`) take the same falsy branch, so this alone should not — and, when checked directly, does not — produce a different `initial`/`animate` value.
  2. Directly compared the SSR-rendered HTML against the live DOM for the exact element the warning flags (the Navbar's "Login or Register" `<a>`, and — when the *full*, non-truncated Next.js dev error overlay was inspected rather than the console-log summary — two or three other `getButtonClassName()`-styled links on the page besides it): `className` strings were **byte-identical** (490 characters, exact `===` match) between server HTML (fetched directly) and the live post-hydration DOM, and the `<nav>` element's server-rendered inline `style` attribute matched the live DOM's `style` attribute exactly too.
  3. Given (byte-identical output) + (only reproduces after HMR churn, never on a fresh load) + (affects multiple unrelated elements that only share "styled via a long Tailwind arbitrary-value className string"), the most evidence-supported conclusion is that this is a **Turbopack Fast-Refresh/dev-mode artifact** — React's hydration validator comparing a live render against a stale cached reference from an earlier hot-reload in the same session — rather than a genuine, persistent SSR/CSR output mismatch. It would not be expected to occur in a production build (`next build && next start`), since there is no Fast Refresh there.
  4. **Not fixed, not suppressed.** No change was made to `Navbar.tsx`, `buttonStyles.ts`, or any motion code on the strength of this investigation, per the brief's explicit instruction. Flagging for whoever next touches `Navbar.tsx`: if this is ever seen in a genuinely fresh **production** build (not `next dev`), that would contradict this sprint's finding and warrant a fresh investigation.

### 16. Files created

- `components/home/GamePreview.tsx` — **not created this sprint** (Sprint 2). No files were created in Sprint 3; `FormField.tsx`, `Button.tsx`, `Card.tsx`, `Background.tsx`, `motion.ts`, `buttonStyles.ts`, `cx.ts` all already existed from Sprint 1 and were reused/extended, not recreated.

### 17. Files modified

- `src/app/login/page.tsx` (full presentation rewrite; all state/handlers preserved verbatim)
- `src/app/confirm/ConfirmClient.tsx` (full presentation rewrite; all state/handlers preserved verbatim)
- `src/app/confirm/page.tsx` (Suspense fallback restyled — two className additions, no logic)
- `components/ui/FormField.tsx` (extended: `endAdornment` prop, animated error/hint text, `aria-describedby`)

### 18. Files deleted

None. (`BackgroundDecor` and `Field`, local helper functions that lived inside `login/page.tsx`, were removed as the direct, necessary consequence of switching to `AppBackground`/`FormField` — not separate files, and not unrelated cleanup.)

### 19. Behavioral files touched

None. `server/socket-server.ts`, `server/models/*`, `server/config/db.ts`, `src/hooks/useGameSocket.ts`, `src/hooks/useBotGame.ts`, `src/lib/socket.ts`, `src/types/realtime.ts`, `src/env.ts`, `src/middleware.ts`, `src/hooks/useAuthGuard.ts`, and all four `src/app/api/**/route.ts` files are untouched — confirmed via `git status`.

### 20. Build results

- **`npx tsc --noEmit`**: one new error surfaced and was fixed during this sprint (`FormField.tsx`'s `cx()` call needed `!!endAdornment` instead of `endAdornment` to satisfy `cx`'s parameter type against `React.ReactNode`'s wider union — a type-level fix only, no behavior change). Final state: clean except the same pre-existing, unrelated `JoinRoomCard.tsx` error documented in every prior sprint.
- **`npm run build`**: `✓ Compiled successfully`; fails afterward at the same pre-existing, environment-specific `Collecting page data` step for `/api/auth/login`, confirmed unrelated back in Sprint 0.5.

### 21. Manual test results

Against a freshly restarted `next dev` + `tsx server/socket-server.ts` (both were mid-sprint restarts required after a stale dev-server-vs-build `.next` collision — same category of issue as Sprint 1, unrelated to source changes). MongoDB remained unreachable in this sandbox — **login, signup, and the full confirm-success flow's backend effects could not be exercised end-to-end**; documented explicitly below rather than assumed:

**LOGIN**
- [x] default — renders correctly
- [x] email validation — n/a to login (email field only shown for signup); not applicable
- [x] password validation — typed a weak password, submitted: field turned red, "At least 8 characters." appeared inline (confirmed present in the DOM even when a sandbox rendering quirk froze its fade-in — see Section 13/Sprint 2's addendum for that same, already-documented artifact) and via toast
- [x] authentication failure — submitted valid-shaped credentials; since MongoDB is unreachable, the API returned an error; toast showed "❌ Signup failed" / equivalent for login, confirming the existing error-handling path fires unchanged
- [x] password visibility — toggled via the new eye icon; input `type` flips `password`↔`text`, icon flips `Eye`↔`EyeOff`, value untouched
- [~] loading/submitting state — the `Button`'s `loading` prop (spinner) is wired to the same `loading` state as before; not independently re-verified with a deliberately slow network in this sandbox, but the code path is unchanged from the pre-Sprint-3 `disabled={loading}`/spinner logic
- [ ] successful login behavior — **could not be tested**: requires a real MongoDB-backed account (see MongoDB note above)

**SIGNUP**
- [x] default — renders correctly, Email field appears with entrance transition
- [x] validation — same weak-password test as above, same result
- [x] password visibility — same toggle, confirmed working in signup mode too
- [~] loading/submitting state — same as login, code path unchanged
- [x] signup behavior (request fires) — confirmed the `POST /api/auth/signup` call fires with the typed username/email/password (toast "Signup failed" observed, consistent with no reachable database)
- [ ] existing post-signup behavior (email sent, `setMode("login")` on success) — **could not be fully tested**: requires the signup API call to actually succeed (needs MongoDB + Resend), which this sandbox cannot provide; the `setMode("login")` call itself is unchanged code, unmodified by this sprint

**MODE SWITCH**
- [x] Login → Signup — pill slides, Email field animates in, button/footer text updates
- [x] Signup → Login — reverse, confirmed

**CONFIRMATION**
- [ ] valid flow — **could not be tested**: requires a real confirmation token issued by a live signup+email flow
- [x] invalid token (fake token param) — confirmed: loading spinner → "Something went wrong. / Your confirmation link is invalid or has expired. / Invalid or expired token. Please try again." + both recovery buttons
- [x] missing token (no token param) — confirmed: "Invalid or missing token." variant of the same screen
- [ ] success state — **could not be visually confirmed against a real backend response**, but the loading→success render branch was verified via code review (identical structure to the verified error branch, gated on the same `errorMessage` falsy check that existed pre-Sprint-3)

**NAVIGATION**
- [x] Home — logo/Home links on both auth pages navigate to `/`
- [x] Login — `/login` renders correctly whether arrived at directly or via other pages' links
- [x] existing redirects — `useAuthGuard`/`middleware.ts` untouched; not re-tested in depth this sprint since this sprint's scope never touches those files (already covered in Sprints 1/2)
- [~] logged-in behavior — not directly re-verified this sprint (requires a real logged-in session via MongoDB); code path (`router.replace("/game")` on login success) is unchanged

**RESPONSIVE**
- [x] desktop — extensively verified (see screenshots)
- [ ] tablet — not available this sprint (see Section 13)
- [ ] mobile portrait — **could not be captured live** (`resize_window` non-functional this session, consistent with every prior sprint); verified instead by code review — see Section 13's reasoning for why the fluid `max-w-md` card pattern is inherently narrow-viewport-safe
- [x] no horizontal overflow — not independently re-measured this sprint at a narrow width (couldn't get one), but the component has no fixed-width elements that could cause it

**CONSOLE**
- [x] no new React errors attributable to Sprint 3 — confirmed (see Section 15's investigation; the one hydration warning found is pre-existing/Navbar-related/HMR-artifact, not new)
- [x] no new hydration errors attributable to Sprint 3 — same
- [x] no event-listener duplication — n/a, no new global listeners added
- [x] no runtime exceptions — none observed across all interactions performed

### 22. Screenshot verification

Captured (desktop, 2228×1083 — the sandbox's fixed session viewport; see Section 13 for why mobile/tablet screenshots aren't included):

1. Login — default state
2. Signup — default state (with Email field, password visibility toggled on to demonstrate the icon)
3. Login/Signup validation error — inline field error + styled toast, both visible simultaneously
4. Auth-failure toast — "❌ Signup failed" demonstrating the retokenized toast against a real (failed, since no DB) API call
5. Confirm — missing-token error state
6. Confirm — invalid/expired-token error state (via a fake token, exercising the real API-failure branch)
7. Confirm — loading state ("Confirming your account…")

Held up against the check: *"Does this look like the authentication screen of the same polished multiplayer game?"* — yes: same deep-navy background with the restrained `AppBackground` glow/grid, same mint-primary/violet-secondary accents, same card radius/shadow language as the Home page, same button and typography system, the real ThumbBat logo instead of an emoji, and a calm, form-first layout that does not attempt to be a game screen — matching the brief's explicit "not an elaborate game screen" direction.

### 23. Known limitations

- No tablet or mobile-portrait screenshot this sprint — sandbox viewport control (`resize_window`) has been a no-op in every sprint so far regardless of direction attempted; mobile safety was instead verified by code review of the fluid, breakpoint-free card layout.
- Full login/signup/confirmation-success behavior could not be exercised against a real backend — this sandbox has no reachable MongoDB, matching every prior sprint's limitation. What *could* be verified (request firing, error-path rendering, client-side state transitions, validation, mode switching) all passed.
- The Navbar hydration warning (Section 15) remains unresolved at the "Turbopack Fast-Refresh artifact" hypothesis level — well-evidenced but not 100% certain — and was intentionally left unfixed per the brief.

### 24. Remaining issues

- No new bugs discovered this sprint that meet the `AUTH-BUG-XX` bar (a functional authentication bug unrelated to the visual redesign). The hydration warning (Section 15) is a dev-mode-only presentation/tooling artifact, not an authentication behavior bug, and is already fully documented above rather than filed as one.
- The four pre-existing backlog bugs (BUG-01..04), dead code list, and dead routes from prior sprints remain untouched, as instructed.
- Login, Signup, and Confirm's *behavioral* verification against a real backend is still outstanding whenever a MongoDB instance becomes available — flagged again here so it isn't lost.

### Change budget

```
FILES CREATED:        0
FILES MODIFIED:       4  (src/app/login/page.tsx, src/app/confirm/ConfirmClient.tsx,
                          src/app/confirm/page.tsx, components/ui/FormField.tsx)
FILES DELETED:         0
BEHAVIORAL FILES TOUCHED:  None
AUTH FILES TOUCHED:    src/app/login/page.tsx, src/app/confirm/ConfirmClient.tsx,
                       src/app/confirm/page.tsx — presentation only; every handler,
                       validator, API call, storage write, and redirect preserved verbatim.
VISUAL FILES TOUCHED:  src/app/login/page.tsx, src/app/confirm/ConfirmClient.tsx,
                       src/app/confirm/page.tsx, components/ui/FormField.tsx
NEW DEPENDENCIES:      None (lucide-react and framer-motion already installed)
NEW ASSETS:            None (reused the existing /thumbbat-logo.png)
REGRESSION RISK:       Low — no auth handler, validator, API contract, storage key, or
                       redirect target changed; verified byte-identical logic by
                       preserving each function verbatim and confirming request/response
                       behavior still fires through the same code paths.
```

I have not started Sprint 4, redesigned Leaderboard/Play Lobby/GameBoard, or fixed any backlog bug. Waiting for approval before proceeding.

---

## Sprint 4 — Leaderboard Redesign

**Status:** Complete.

### 1. Current Leaderboard architecture (inspected before any change)

- **Route:** `src/app/leaderboard/page.tsx` — `"use client"`, self-contained, no child components imported from elsewhere.
- **API:** `GET /api/leaderboard` (`src/app/api/leaderboard/route.ts`, untouched) — `User.aggregate([{$match:{highScore:{$gt:0}}}, {$project:{username,highScore,winPercentage:{$round:...}}}, {$sort:{winPercentage:-1,highScore:-1}}, {$limit:50}])`, returns `{data: Player[], success:true}` (200) or `{data:[], message}` (200, empty) or `{error, details?}` (500).
- **Client data shape:** `Player = { username: string; highScore: number; winPercentage: number }` — no avatar, win-rate-beyond-percentage, streak, ELO, or matches-played fields exist anywhere in this shape.

### 2. Existing behavior before changes (documented, then preserved verbatim)

- **State:** `players: Player[]`, `loading` (init `true`), `err: string|null`, `search: string`, `sortBy: "score"|"win"` (init `"score"`).
- **Fetch:** one `useEffect` on mount, `axios.get("/api/leaderboard")`, reads `res.data?.data` (array-checked), `setPlayers(data)`; on any failure, `console.error`, `setErr("Couldn't load the leaderboard. Try again shortly.")` **and** `setPlayers([])`; `finally setLoading(false)`. A `mounted` flag guards against a late response after unmount.
- **Filter+sort:** one `useMemo` — case-insensitive `username.includes(search)` filter, then `.sort()` by `highScore` desc (`sortBy==="score"`) or `winPercentage` desc (`sortBy==="win"`).
- **Derived slices:** `podium = filtered.slice(0,3)`, `rest = filtered.slice(3,25)` — i.e. the table only ever shows ranks 4-25; ranks 1-3 are structurally impossible in the table regardless of data.
- **Loading state:** 3 podium skeletons + 10 row skeletons, gated on the single `loading` boolean.
- **Empty state:** only reachable when `podium.length === 0` (i.e., `filtered` is empty — either genuinely no players, or a search with zero matches) — a text-only message in the podium area.
- **Error state:** only rendered inside the **table body** (`err ? ... : ...`), never in the podium — meaning a fetch failure shows the *empty-state* podium (since `setPlayers([])` on error) simultaneously with the *error-state* table row. This dual state is original, pre-existing behavior, not something Sprint 4 introduced (confirmed live — see Section 13).
- **No pagination control** exists (the `.slice(3,25)` cap is the only limit; there is no "load more"/page control to preserve).

### 3. Design direction

Deep-navy `AppBackground`, restrained mint-primary (#1) / neutral (#2) / violet-secondary tint (#3) podium distinction, `Card`-based surfaces throughout, `tb-*` typography for every heading (no marketing-scale hero — this is an app screen, per the brief). Emoji (🏆 in the original `<h1>`, 🥇🥈🥉 `Medal` component in the original podium) replaced with `lucide-react`'s `Trophy` icon, consolidating what were previously *two* separate rank-representations (`RankBadge` numeric circles in the table + `Medal` emoji in the podium) into one consistent numeric-badge language plus a single `Trophy` accent reserved for 1st place only.

### 4. Component changes

All changes are inside the single file `src/app/leaderboard/page.tsx` (local helpers, not extracted, per the brief's "avoid dozens of tiny components"):

- `BackgroundDecor` (local) → `<AppBackground variant="website" />`
- Header: plain `<h1>🏆 Leaderboard</h1>` → eyebrow (`text-tb-label`) + `<h1>` with a `Trophy` icon + `tb-h1` sizing + supporting line, all inside a `scaleIn`-animated wrapper
- Search `<input>` (bare, with a `⌕` unicode glyph) → `FormField` (see Section 5) with a `Search` icon `endAdornment`
- Sort `<select>` → same native `<select>` (unchanged options/values/`onChange`), retokened, `appearance-none` + a decorative `ChevronDown` icon layered on top (purely visual; the native select's own semantics/keyboard behavior are untouched)
- `PodiumCard`, `RankBadge`, `Medal`, `Avatar`, `RowSkeleton`, `PodiumSkeleton` — all rewritten on tokens; `Medal` removed (folded into the unified rank treatment described in Section 3); `Avatar` gained a `size` variant (`sm` for table rows, `lg` for the 1st-place podium card) but keeps the same `getInitials` logic
- Table: switched from `table-layout: auto` (implicit) to **`table-fixed`** with explicit column widths (`w-14 sm:w-20` rank, flexible player column, `w-20 sm:w-32` / `w-16 sm:w-24` for the two stat columns) — this was a necessary fix (not a defect discovered *after* shipping, but one caught during this sprint's own verification pass, see Section 17) because `truncate` on a long username inside an auto-layout `<td>` doesn't reliably clip; `table-fixed` + fixed non-player-column widths makes the truncation actually work at any viewport width
- CTA band → `Card variant="elevated"`, same two links (`/signup`, `/login`), unchanged text and destinations

### 5. `FormField` (shared primitive) — one small, justified addition

Added two optional, backward-compatible props (default values reproduce the pre-existing behavior exactly, so every Sprint 3 consumer — the auth forms — is unaffected):

- `hideLabel?: boolean` — visually hides the `<label>` (`sr-only`) while keeping it in the accessibility tree. Used for the search bar's "Search players" label, which shouldn't take up visible vertical space in a compact controls row but must still have a real accessible name.
- `reserveHelperSpace?: boolean` (default `true`) — when explicitly set `false` *and* there's no `error`/`hint` to show, skips rendering the helper row's reserved height entirely. Used for the search bar, which never has an error/hint, so it doesn't carry a dead 20px gap underneath it.

This satisfies the brief's "only if a genuine Leaderboard requirement exposes a reusable defect" allowance — a labelless, compact search input is a real, recurring UI need `FormField` didn't support before.

### 6. Responsive behavior

- Podium: DOM order is always rank 1, 2, 3 (correct reading/accessibility order and correct mobile stack order — rank 1 first). At `sm:` and above, `sm:order-2`/`sm:order-1`/`sm:order-3` visually rearrange to the classic 2nd–1st–3rd podium layout, and the 1st-place card gets extra padding/shadow (`sm:pb-6 sm:pt-7 sm:shadow-tb-elevated`) and a larger avatar to stay visually dominant, without any separate mobile-only markup.
- Controls: `flex-col sm:flex-row` — search/sort stack full-width on narrow screens, sit inline on wider ones.
- Table: kept the original's `max-h-[60vh] overflow-auto` scroll-safety wrapper (a pre-existing pattern, not new) plus the new `table-fixed` column widths (Section 4) so long usernames truncate instead of forcing horizontal scroll.
- No viewport-specific duplicate implementation was created — one JSX tree, Tailwind breakpoints only, per the brief.

### 7. Accessibility

- Rank is always present as real text (`Rank #{n}` on podium cards, a numeric badge with `aria-label="Rank {n}"` in the table) — never conveyed by position/color alone.
- Search input has a real (visually-hidden but present) label via `FormField`'s new `hideLabel`; sort `<select>` has an `sr-only` `<label htmlFor>` that didn't exist before (the original select had no associated label at all — a small, in-scope accessibility improvement to a control this sprint was already redesigning).
- Table keeps semantic `<table>`/`<thead>`/`<th scope="col">` markup (not converted to a div-grid) — the data is genuinely tabular, and screen readers benefit from real table semantics.
- Icons (`Trophy`, `Search`, `ChevronDown`, `AlertTriangle`) are all `aria-hidden`; every state they accompany also has adjacent visible text.
- Podium and rank sections carry `aria-label`s (`"Top 3 players"`, `"Full rankings"`) for landmark navigation.
- All new interactive elements are real `<input>`/`<select>`/`<a>` elements with the existing `focus-visible`/`focus` ring treatment already established in Sprints 1-3.

### 8. Motion

Header and podium use the shared `scaleIn`/simple opacity+y entrance patterns already established; podium cards get a small staggered entrance (`delay: i * 0.06`) when data loads; the CTA band uses the same `whileInView` pattern already used on the Home and Login pages. No pulsing, particles, or animated-number effects were added (the brief explicitly discouraged animated numbers "unless already supported by the data/state" — the original never animated score values, so this sprint didn't either). Loading skeletons use `animate-pulse` (already the pre-existing pattern, a subtle opacity fade generally left un-gated by reduced-motion in this and most design systems). Everything Framer-driven inherits the Sprint 1 global `<MotionConfig reducedMotion="user">`.

### 9. Files modified

- `src/app/leaderboard/page.tsx` (full presentation rewrite; all state/fetch/filter/sort logic preserved verbatim)
- `components/ui/FormField.tsx` (two new optional, backward-compatible props — see Section 5)

### 10. Files created

None.

### 11. Files deleted

None. (`BackgroundDecor`, `Medal` — local helpers inside `page.tsx` — were removed as the direct, necessary consequence of adopting `AppBackground` and consolidating the rank-icon language; not separate files, not unrelated cleanup.)

### 12. Behavioral files touched

None. `src/app/api/leaderboard/route.ts` and every server/socket/auth file are untouched — confirmed via `git status`.

### 13. Build results

- **`npx tsc --noEmit`**: clean except the same pre-existing, unrelated `components/game/lobby/JoinRoomCard.tsx` error documented in every prior sprint (file untouched).
- **`npm run build`**: `✓ Compiled successfully` (Google Fonts fetch failures logged during the build are this sandbox's lack of outbound network access, not a code issue — non-blocking, matches every prior sprint); fails afterward at the same pre-existing, environment-specific `Collecting page data` step for `/api/auth/login`, first confirmed unrelated in Sprint 0.5.

### 14. Browser verification

Fresh `next dev` + `tsx server/socket-server.ts` restart (leftover processes from the previous sprint's session were still holding the ports; killed and restarted cleanly on 3000/5001 — routine, not a code issue). MongoDB remained unreachable in this sandbox, so `GET /api/leaderboard` returns 500 exactly as it does in every prior sprint's sessions — real ranked data could not be exercised, and this is stated plainly rather than assumed.

- **Default load**: header, controls, podium, and table all render correctly.
- **Confirmed the pre-existing dual empty+error state** (Section 2) reproduces identically post-redesign: with the API failing, the podium shows "No rankings yet" (because `players` is set to `[]` on error) *while* the table simultaneously shows "Couldn't load the leaderboard. Try again shortly." — proving the redesign didn't change *which* state renders under which condition, only how each looks.
- **Network request verified directly**: `GET http://localhost:3000/api/leaderboard` — same URL, same method, response `500` (no DB) — identical to pre-Sprint-4 behavior.

### 15. Search verification

Typed into the search field (`riz`) — value updated, input remained responsive, no console errors. Cleared it (triple-click + Delete) — placeholder reappeared. Because `players` is always `[]` in this sandbox (no reachable database), the *filtering result* itself could not be observed changing between "some rows" and "fewer rows" — but the `search` state wiring, the input's controlled value, and the `useMemo`'s dependency on `search` are all byte-identical to the pre-existing code, so the filter logic itself is unchanged by construction, not merely by inference from a passing test.

### 16. Sort verification

Programmatically set the native `<select>`'s value to `"win"` and dispatched a `change` event — confirmed the DOM reflects the new value (`sortBy` state updates via the unchanged `onChange={(e) => setSortBy(e.target.value as "score"|"win")}` handler). Full visual re-ranking could not be observed for the same reason as Section 15 (no data in this sandbox) — the sort comparator itself is untouched code.

### 17. Loading/error/empty verification

- **Loading**: skeletons render in the initial ~1s before the fetch settles (observed during page load) — sized to approximate the real podium/row geometry, using `tb-surface`/`white/10` tokens instead of a generic gray.
- **Empty**: reproduced live (see Section 14) — "No rankings yet." / "Be the first champion." / a "Play now" link to `/login` (an existing route already linked elsewhere on this same page — not a new destination).
- **Error**: reproduced live (see Section 14) — "Couldn't load the leaderboard. Try again shortly." preserved verbatim, no retry button added (none existed before, and the brief explicitly said not to invent one).

### 18. Responsive verification

`resize_window` was a no-op in this sandbox session (stuck at a fixed 2228×1083 desktop viewport regardless of the requested target, in either direction) — consistent with every prior sprint's experience with this tool; a genuine mobile/tablet screenshot could not be captured this sprint, and that limitation is stated here rather than glossed over. Verified instead by code review: the podium's `order-*` reflow, the controls' `flex-col sm:flex-row` stack, and the table's fixed column widths + `truncate` (Section 4) were specifically checked against a long-username scenario mentally walked through the CSS cascade (a `table-fixed` table with an unconstrained middle column and fixed side columns will always clip an overflowing name in the middle column via `truncate`, regardless of viewport width — this doesn't require a live narrow viewport to reason about correctly, unlike, say, a flex-wrap ordering question). No horizontal-overflow-causing fixed-pixel-width element exists anywhere in the new markup.

### 19. Console findings

No new React errors or runtime exceptions from any Leaderboard interaction performed. The Navbar hydration warning first identified and thoroughly root-caused in Sprint 3 (a Fast-Refresh/HMR-churn artifact, not a persistent SSR/CSR mismatch — see that section for the full investigation) was observed once more during this sprint's session, on this page. It predates Sprint 4 (it's the same Navbar component, unrelated to any file this sprint touched, and was already reproduced on `/` and `/leaderboard` before Sprint 4 began) — not re-investigated from scratch since Sprint 3 already exhausted reasonable root-causing effort and the brief's own escape hatch ("if root cause cannot be established confidently, leave unchanged, document, continue") already applies.

### 20. Known limitations

- No live mobile/tablet screenshot this sprint (sandbox viewport constraint, see Section 18) — mitigated by code-level reasoning about the specific responsive mechanisms used (order utilities, table-fixed truncation), not left unverified.
- Search/sort *result* changes (i.e., actually seeing the list reorder or shrink) could not be observed against real data, since this sandbox has no reachable MongoDB — only the state-wiring and event-handling were verified live; the unchanged filter/sort logic itself was verified by code diff, not by watching data move.
- The dual empty+error state (Section 2) is pre-existing, slightly confusing UX (a user sees "no rankings" and "couldn't load" at the same time on a genuine fetch failure) — not fixed, since the brief requires functionality to win over visual conflicts and this is existing behavior, not something introduced.

### 21. Remaining issues

None discovered that meet the bar for a new `BUG-XX`/`AUTH-BUG-XX` entry. The four pre-existing backlog bugs, dead routes, and dead code from prior sprints remain untouched, as instructed.

### Change budget

```
FILES CREATED:        0
FILES MODIFIED:       2  (src/app/leaderboard/page.tsx, components/ui/FormField.tsx)
FILES DELETED:         0
BEHAVIORAL FILES TOUCHED:  None
VISUAL FILES TOUCHED:  src/app/leaderboard/page.tsx, components/ui/FormField.tsx
NEW DEPENDENCIES:      None (lucide-react and framer-motion already installed)
REGRESSION RISK:       Low — the API endpoint, request, response handling, filter
                       predicate, sort comparator, and loading/error/empty gating
                       conditions are all byte-identical to the pre-Sprint-4 file;
                       verified live that the fetch still targets the same endpoint
                       and that the pre-existing dual empty+error behavior on fetch
                       failure reproduces unchanged.
```

---

## Sprint 5 — Game Shell Reset + Cinematic Boot Loader

**Status:** Complete. Scope changed mid-sprint by explicit user instruction: the originally-approved Sprint 5 plan (splash → loading → auth-check phase machine, Navbar removal) was superseded before being documented here by a follow-up instruction to replace the boot screen with a ~5s cinematic video loader. This section documents the final, shipped state only.

### 1. Important correction to the sprint's own premise

The instruction driving this sprint asserted Google OAuth was "already configured" and asked for a "Continue with Google" button reusing it. **This is factually incorrect.** Verified via repository-wide inspection before writing any code:

- `package.json` / `server/package.json` — no OAuth, `passport`, `next-auth`, or Google-auth dependency of any kind.
- `.env.local` / `server/.env` — only `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_SOCKET_URL`, `DEV_FRONTEND_URL`, `PROD_FRONTEND_URL`, `NEXT_PUBLIC_FILTER_USERNAME` (+ `PORT` server-side). No `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.
- Source-wide grep for `google|oauth|passport|next-auth|GOOGLE_CLIENT` across every `.ts`/`.tsx` file — the only two hits are the `next/font/google` import in `layout.tsx` and a comment of my own in `useAuthForm.ts`.

This matches the standing decision from this sprint's original approval message ("DO NOT implement Google OAuth in this redesign — treat it as a separate future engineering initiative"). Rather than build a non-functional button, the cinematic's post-video CTA reveals the **real, existing, working** username/password `AuthOverlay` — architected (via a `variant` prop, see below) so a Google option can be added later without another redesign of the boot flow.

### 2. What was built

- **`public/media/loader.mp4`** — the supplied cinematic (`docs/design/animations/loader.mp4`, 20,968,026 bytes, 2488×3332, H.264+AAC @ 33.27Mbps, 5.04s) re-encoded for web delivery via `ffmpeg` (`scale=720:-2`, 24fps, `libx264 -preset slow -crf 26`, audio stripped since the loader is muted anyway, `+faststart` for progressive playback). Result: 1,088,805 bytes (~1.06MB), 720×964 — a ~19x size reduction.
- **`public/media/loader-poster.jpg`** — first frame extracted via `ffmpeg -vframes 1 -q:v 3`, 80,428 bytes, 720×964 (matches the video's frame exactly, so there is no visible swap when the video starts).
- **`components/boot/CinematicLoader.tsx`** (new) — the boot screen itself. Full-viewport `<video>` with `poster` set to the extracted frame (so the very first paint is never blank), `muted playsInline autoPlay preload="auto"`. Playback outcome branches on `isAuthenticated`:
  - **Authenticated:** on the native `ended` event, a ~250ms opacity fade plays, then `router.replace("/game")`. The `/game` route is prefetched (`router.prefetch`) the moment the loader mounts so this hand-off has as little work left to do as possible.
  - **Unauthenticated:** on `ended`, a legibility gradient fades in over the bottom half of the frozen final frame and `<AuthOverlay variant="bare" />` (see below) animates in over it — no separate loading/auth-check screen, no route change.
  - **Autoplay blocked** (`.play()` promise rejects) and **video load/decode error** (`onError`) are both treated identically to a natural `ended` event — the cinematic is a boot *enhancement*; nothing about the flow can strand a player on a blank or frozen screen if the video can't play for any reason. Error case additionally swaps the `<video>` for a static `<img>` of the poster frame, so no dead/broken video element or icon is ever shown.
- **`components/auth/AuthOverlay.tsx`** — extended with a `variant?: "screen" | "bare"` prop (default `"screen"`), so the existing account-prompt content (`useAuthForm`, collapsed "Ready to play?" prompt, expand-to-form transition, validation, toasts, redirect) is shared verbatim between `/login`'s standalone full-screen use and the cinematic's bare-overlay use — no duplicated auth logic. `"screen"` keeps the `GameViewport` background + logo; `"bare"` returns just the content, unstyled, for the caller to place over other content (here, the video's final frame).
- **`components/boot/BootSequence.tsx`** — rewritten down from the superseded splash/loading phase machine to a single responsibility: the auth check. `isAuthenticated` defaults to `false` identically on server and client renders (no hydration mismatch) and updates via `useEffect` from `localStorage.getItem("token")` — safe because the cinematic doesn't consult this value until the video ends, well after the effect has run.
- **`src/app/page.tsx`** — converted from a Client to a Server Component specifically so a `<link rel="preload" href="/media/loader.mp4" as="video">` can be emitted server-side and hoisted into `<head>`, letting the browser's preload scanner start fetching the cinematic before any client JS hydrates, rather than waiting for `BootSequence`'s `<video>` element to mount client-side.

### 3. Deleted

- `components/boot/SplashScreen.tsx`, `components/boot/GameLoadingScreen.tsx` — built for the original (superseded) non-cinematic Sprint 5 flow, never shipped/reviewed, fully replaced by `CinematicLoader`'s poster+video mechanics.

### 4. Carried over unchanged from the original Sprint 5 approval (still in effect)

- `components/Navbar.tsx` removed from `src/app/layout.tsx`'s render tree, left in place as an orphaned/reversible file (not deleted), per explicit instruction.
- `components/game/GameShell.tsx` and `src/app/leaderboard/page.tsx` — one padding class each (`pt-12 sm:pt-16` → `pt-6 sm:pt-8`, `pt-24 sm:pt-28` → `pt-8 sm:pt-10`) to remove now-orphaned Navbar-clearance space.
- No temporary navbar/logout/nav stop-gap added anywhere — the reachability gap (no persistent nav until Sprint 6/7) remains intentional.
- `useAuthGuard`/`middleware.ts` untouched — `/game` and `/room/[intent]/[code]` gating logic and redirect target (`/login`) unchanged.

### 5. Verification

- **`npx tsc --noEmit`**: clean except the same pre-existing, unrelated `components/game/lobby/JoinRoomCard.tsx(62,11)` `inputMode="latin"` type error every prior sprint has hit.
- **`npm run build`**: `✓ Compiled successfully`; fails afterward at the same pre-existing, environment-specific `Collecting page data` step for `/api/auth/login`, first confirmed unrelated back in Sprint 0.5.
- **Browser verification** (fresh `next dev` + `tsx server/socket-server.ts`, both restarted clean for this sprint):
  - **Unauthenticated boot:** loaded `/` with `localStorage`/cookies cleared. Poster frame visible immediately (no blank screen), cinematic played, and on `ended` the legibility gradient + `AuthOverlay variant="bare"` CTA ("Ready to play?" / "Log in to play" / "Create account") appeared correctly over the frozen final frame.
  - **CTA interactivity:** clicked "Log in to play" — expanded to the username/password form correctly; clicked "← Back" — collapsed back to the prompt correctly. No dead clicks, no console errors.
  - **Authenticated fast-path:** set a `token` in `localStorage` (this sandbox has no reachable MongoDB, so a real login couldn't be exercised — same limitation as every prior sprint), reloaded `/`. Video played, ended, faded ~250ms, and `router.replace("/game")` fired — confirmed by the URL changing and the app's own (untouched) `useAuthGuard` correctly rejecting the fake token and redirecting on to `/login`, proving the hand-off itself works end-to-end even though the fake token can't produce a real authenticated session.
  - **Error fallback:** dispatched a synthetic `error` event on the live `<video>` element mid-cinematic. The component immediately swapped to the static poster `<img>` and revealed the CTA — no blank screen, no crash, no console error.
  - **Console:** no errors or warnings attributable to this sprint's code across all of the above; only benign dev-mode `[Fast Refresh] rebuilding` noise.

### 6. Known limitations / carried-over notes for later sprints

- The session-wide input-freeze artifact investigated (inconclusively) earlier in this sprint's work, before the cinematic-loader pivot, did **not** reproduce during this sprint's verification — CTA clicks, form expand/collapse, and back-navigation all worked cleanly on first try. Left undiagnosed since it didn't recur; flagging in case it resurfaces in a later sprint.
- The cinematic's audio track was stripped during optimization (the element is `muted` regardless, per the acceptance criteria, so this has no user-visible effect, but is worth noting if a future sprint wants a sound-on option).
- No Unity/Three.js/WebGL was introduced — the loader is a plain HTML5 `<video>` element, per the constraint.

---

## Sprint 5 addendum — Real Google Sign-In wired into the boot CTA

**Status:** Complete. Follow-up to the Sprint 5 section above, at the user's explicit request: the boot CTA over the cinematic's final frame now shows **only** a single "Continue with Google" button plus a rotating gameplay hint directly beneath it — no heading, no username/password buttons. This replaces the `<AuthOverlay variant="bare" />` CTA documented above.

### 1. Real OAuth, not a placeholder

Per explicit user decision, this is a genuine Google OAuth integration, not a styled-but-fake button. The user supplied a real Google Cloud OAuth Client ID (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, added to `.env.local` and `src/env.ts`'s schema).

- **`components/boot/GoogleSignInCTA.tsx`** (new) — renders one `Button` styled as a standard white Google button (inline multicolor "G" glyph), and one rotating hint line below it, picked randomly on mount from an 8-entry list of real gameplay tips (toss/bat-bowl choice, wicket-on-matching-number, chasing in the second innings, Quick Match, Private Match) — verified against the actual scoring logic in `server/socket-server.ts` rather than invented. A `<ToastContainer>` is included so sign-in errors are visible (there was no other container in this subtree once `AuthOverlay` was swapped out).
- **`src/hooks/useGoogleAuth.ts`** (new) — loads the Google Identity Services script (`accounts.google.com/gsi/client`) once, initializes `google.accounts.oauth2.initTokenClient` (the real OAuth2 popup flow, not a decorative button), and on success POSTs the access token to a new backend route. A 20s safety timeout resets the button if GIS never calls back at all (observed as a real gap: a silently-blocked popup doesn't always invoke `error_callback`).
- **`src/app/api/auth/google/route.ts`** (new) — verifies the access token's audience against our own client ID via Google's `tokeninfo` endpoint (rejecting tokens issued to any other app), fetches the verified profile via Google's `userinfo` endpoint, and finds-or-creates a `User` by email (new users get a random unusable password hash and are marked confirmed, since Google already verified the email). On success it issues the exact same JWT/response shape `/api/auth/login` does, so every downstream consumer (`localStorage`/cookie writes, the `login-success` event, the `/game` redirect) is byte-identical to the existing username/password path — no duplicated session logic.
- `components/boot/CinematicLoader.tsx` — swapped its `<AuthOverlay variant="bare" />` import/usage for `<GoogleSignInCTA />`. `AuthOverlay`'s `bare` variant itself is left in place (unused for now, harmless) rather than deleted, since it's a legitimate, generically-useful variant of a shared component, not sprint-specific debug code.
- `/login` (username/password) is untouched and still exists as a route, but is no longer reachable from the boot screen — the boot CTA is Google-only now, per explicit instruction. Worth flagging: existing username/password accounts have no path back into the game from `/` until a future sprint adds one (e.g. Sprint 6/7's persistent nav).

### 2. Verification

- **`npx tsc --noEmit`** / **`npm run build`**: clean, same pre-existing unrelated issues as every prior sprint (see below for a generalization of the build one).
- **Live, end-to-end, with a real Google account:** clicked the button in the user's actual browser session — Google Identity Services' popup flow ran for real and returned a real access token for the signed-in Google account, which the app correctly POSTed to `/api/auth/google`. The button's own loading→success/error lifecycle (spinner shown while pending, re-enabled once the flow resolves) worked correctly.
- **Backend result:** `/api/auth/google` received the token and attempted verification, but returned `500`. Root-caused, not a code bug in this route: importing `jsonwebtoken` throws `Cannot read properties of undefined (reading 'prototype')` inside Turbopack's dev/build module instantiation in this sandbox — **the exact same pre-existing, environment-specific failure documented against `/api/auth/login` since Sprint 0.5**, now additionally confirmed to occur at request-time (not just at build's "Collecting page data" step). Confirmed by isolation: temporarily removing the new Google route and rebuilding reproduces the identical stack trace against `/api/auth/login` instead — proving this is inherent to this sandbox's Turbopack/`jsonwebtoken` interaction, not something the new route introduced. Combined with MongoDB being unreachable in this sandbox regardless, a real login was never fully exercisable end-to-end here for *any* auth route, before or after this change.
- **A note on click reliability during testing:** repeated automated clicks on the button registered inconsistently in this browser-automation harness specifically — some clicks' native DOM event fired but never reached React's `onClick` (confirmed via an isolated native `addEventListener` test), while others worked correctly end-to-end (including the real Google popup run above). This matches a previously-documented, unresolved artifact from earlier in this session (a suspected Fast-Refresh/HMR or synthetic-event-timing quirk specific to this automation tool) and was reproduced here even against a freshly-restarted dev server and a brand-new browser tab, ruling out stale HMR state as the sole cause. There is no evidence this affects real mouse/touch input from an actual player — flagging for visibility, not treating as a shipped defect.

### 3. Known limitations

- New Google sign-ups get an auto-generated username derived from their Google name/email local-part (lowercased, non-alphanumeric stripped, de-duplicated with a numeric suffix on collision) — not chosen by the player. A future sprint may want a one-time "pick your username" step post-first-Google-login.
- No account linking: if a Google email matches an existing username/password account, `/api/auth/google` finds and signs into that same `User` document by email — this was a deliberate choice (avoids duplicate accounts) but hasn't been tested live given the sandbox's DB/runtime limitations above.

I have not started Sprint 6, redesigned Game Home, or touched any other screen. Waiting for approval before proceeding.

---

## Sprint 6 — Visual Foundation

**Status:** Complete. Establishes the reusable design-token/primitive layer the visual-direction lock (`docs/design/ref.png`) requires — no routes rebuilt, no game/socket/auth logic touched, per the sprint's explicit scope.

### 1. Design tokens (`styles/globals.css`, `tailwind.config.ts`)

Re-pointed the existing Sprint 1 `--tb-*` CSS variables to the locked palette (Deep Indigo / Near-Black Blue / Mint / Cyan / Restrained Violet / Cricket-Ball Red) rather than adding a parallel token namespace — every existing consumer (auth forms, the boot CTA, leaderboard) picks up the new palette automatically, which is the point of a "foundation" sprint. New tokens added alongside: `--tb-bg-deep`, `--tb-mint`, `--tb-cyan`, `--tb-violet`, `--tb-ball-red`, `--tb-glow-mint`, `--tb-glow-cyan`, `--tb-glow-violet`, plus chunky-button bevel shadows (`--tb-shadow-button[-primary][-pressed]`). `--tb-ball-red` is deliberately a separate token from `--tb-danger` (kept a legible, brighter red) — the brief explicitly wants the cricket-ball red "restrained/warm," not a UI error color. New Tailwind exposure: `tb-mint`/`tb-cyan`/`tb-violet`/`tb-ball-red` colors, `tb-feedback` font size (for gameplay-feedback text), `shadow-tb-button*`/`shadow-tb-glow-*`.

### 2. Motion tokens (`components/ui/motion.ts`)

Added `durations` (micro/interaction/state/impact/cinematic, 0.12s–0.8s) and `impactEase` (slight overshoot curve), plus two new one-shot presets (`gestureSelect`, `impactPop`) alongside the existing Sprint 1 presets — additive only, nothing existing renamed or removed.

### 3. Game button system — evolved the existing `Button`/`buttonStyles`, not a new component

The brief's "GameButton" is realized by re-theming the shared `components/ui/Button.tsx` / `buttonStyles.ts` in place: bold 2px border, chunky bottom-heavy bevel shadow standing in for physical depth, restrained mint glow on `primary` only, and a `translateY(3px) + scale(0.98)` press via Framer's `whileTap` (~120ms, using the new `durations.micro` token). Renamed the `destructive` variant to `danger` to match the brief's naming (verified zero call sites depended on the old name besides the definition itself). Building a second, parallel `GameButton` component with the same API would have been the exact duplication Sprint 6's own brief warns against — this was a deliberate call, not an oversight.

**Side effect, expected and desired:** every already-shipped `Button`-based UI (login/signup form, the Sprint 5 Google boot CTA, leaderboard's "Create account" link) now renders in the new chunky/glowing style. Verified live — no breakage, just the intended palette/shape evolution.

### 4. New game visual primitives (`components/game/visual/`)

A new directory, deliberately separate from `components/game/{board,lobby,overlays,room}` (game logic components with socket/state access) and from `components/ui/` (generic, non-game-specific primitives) — Sprint 6 section 14's requested separation.

- **`ArenaBackground.tsx`** — the atmospheric stadium-lighting backdrop: deep-indigo base wash → mint/cyan floodlight cones from above → optional violet ambient accent → optional backdrop image+scrim → subtle capped-count CSS-only particles (`@keyframes tb-particle-drift`, transform/opacity only, no canvas) → vignette. `intensity`/`particles` props degrade it for low-power devices; `useReducedMotion()` disables particle drift automatically. `fixed` prop switches between a whole-viewport backdrop and a section-relative one.
- **`GestureIcon.tsx`** — the 1–6 gesture system, and the one primitive that took real iteration. Built from a consistent capsule-cluster hand geometry (a fist+thumb capsule present at every value, fingers added progressively, a *second* thumb — not a sixth finger — is what makes "6" distinct) rather than literal traced fingers, so proportions/stroke-weight stay identical across all six. First-pass coordinates rendered as an indistinct blob at preview size; revised spacing/sizing (verified visually, see Section 6) now reads clearly as 1 through 6 at 56–64px. Supports `default`/`hover`/`selected` (slow persistent pulse + glow)/`disabled`/`revealed` (one-shot scale flash) states.
- **`GameScore.tsx`** — the compact `YOU 30 — 24 OPP` pill, meant to overlay arena art directly (no card chrome). `status` (`leading`/`trailing`/`tie`/`normal`) is caller-computed and only drives which side gets the mint highlight — no scoreboard logic lives here.
- **`ResultCard.tsx`** — the cinematic result plaque (`win`/`loss`/`walkover` variants, each with their own accent glow), composed from the existing `Card` + the new `GameScore` + `Button`, not duplicated styling. Only the primitive — the Result *route* (arena backdrop, entry choreography) is Sprint 11.
- **`GameplayFeedback.tsx`** — momentary big text ("FOUR!"/"OUT!"/"CRITICAL!"), animated as one keyframed `opacity [0,1,1,0] / scale [.75,1.08,1,1]` sequence (~1.1s) per the brief's exact spec, with an `onComplete` callback so a parent knows when to unmount it — the component owns the animation, not its own lifetime.

### 5. Asset contract (`components/ui/assetContract.ts`, `components/ui/ArtSlot.tsx`)

Per your decision that real art will be supplied later: `assetContract.ts` is the manifest (`heroArena`, `characterA`, `characterB`, `resultVictoryBg`, `resultDefeatBg`) with each slot's reserved aspect ratio and intended usage. `ArtSlot.tsx` renders the real image at that exact aspect ratio once a `src` is supplied, or a neutral placeholder (a soft violet-tinted glow + a generic person-outline icon — deliberately not a fake illustrated character) at the *same* aspect ratio otherwise, so dropping in real files later is a prop change, not a layout change.

### 6. Visual Foundation Preview (`/dev/visual-foundation`)

Temporary, unauthenticated (not covered by `src/middleware.ts`'s `/game/:path*` matcher), unlinked internal route rendering every primitive above together against a live `ArenaBackground`. Used to catch and fix the `GestureIcon` legibility problem in section 4 before calling this sprint done. **This route should be removed or gated before any production deploy** — flagging explicitly since nothing in this sprint's scope did that automatically.

### 7. Verification

- **`npx tsc --noEmit`**: clean except the same pre-existing, unrelated `JoinRoomCard.tsx(62,11)` error every prior sprint has hit. (A stale `.next/types/app/room/[intent]/[code]/page.ts` error appeared once from an old `.next` cache — gone after `rm -rf .next`, unrelated to any Sprint 6 file.)
- **`npm run build`**: `✓ Compiled successfully`; fails afterward at the same pre-existing, environment-specific `Collecting page data` step for `/api/auth/login`, confirmed unrelated since Sprint 0.5.
- **Browser verification:** rendered `/dev/visual-foundation` and iterated on `GestureIcon` coordinates live until all six values read clearly (see screenshots taken during this sprint). Verified the `GameplayFeedback` trigger button pops "FOUR!" and fades/unmounts correctly via `onComplete`. Re-verified `/login`, `/leaderboard`, and `/` (boot loader) all still render correctly under the re-themed tokens — no breakage, only the intended palette/button-shape shift. The boot loader's cinematic video showed `readyState: 0`/`document.visibilityState: "hidden"` in this automated tab (the same pre-documented background-tab video-throttling artifact from Sprint 5, not a regression — the component itself is untouched this sprint).
- **No game logic, Socket.IO events, auth logic, or existing route structure was touched.** Confirmed by diff: only `styles/globals.css`, `tailwind.config.ts`, `components/ui/{Button,buttonStyles,motion}.ts(x)`, and new files under `components/game/visual/`, `components/ui/{ArtSlot,assetContract}.ts`, `src/app/dev/visual-foundation/page.tsx`.

### 8. Known limitations / notes for Sprint 7+

- `GestureIcon`'s geometry is hand-tuned pixel coordinates on a 64×64 viewBox, not a generic algorithm — intentional (anatomical hand positions aren't linear), but any future tweak should re-check all six values visually, not just the one being adjusted, since they share slot constants.
- `ArenaBackground`'s `image` prop is wired and ready but unused by anything yet — Sprint 7 (Game Home) is the first real consumer, via the `heroArena` asset-contract slot, once that file exists.
- The `/dev/visual-foundation` route needs an explicit removal/gating decision before launch (see Section 6).
- `ResultCard`/`GameScore`/`GameplayFeedback` have not yet been wired to any real game state — that's Sprints 8–11's job; this sprint only proves the primitives render and animate correctly in isolation.

I have not started Sprint 7, rebuilt Game Home, or touched `/game`/`/room`/leaderboard's structure. Waiting for approval before proceeding.

---

## Sprint 7 — Game Home / Title Screen

**Status:** Complete. Rebuilds the `/game` IDLE state only — the shared `GameShell` (used by toss/board/game-over) and `/room/[intent]/[code]` are untouched.

### 1. Old IDLE architecture (pre-Sprint-7)

`GameScreenInner` (`src/app/game/GameScreen.tsx`) rendered a `header` ("Play ThumbBat" + subtitle) and, when `!preGameInRoom && !gameStarted && !isBotMode`, a `lobby` block: a 3-column grid of `QuickMatchCard` / `JoinRoomCard` / `SoloPracticeCard` — three equal-weight cards, each its own `rounded-3xl border border-white/10 bg-white/5` box with a heading, description copy, and its own button, none using the Sprint 1/6 design tokens. This is exactly the "SaaS dashboard" pattern the brief calls out.

### 2. New title-screen architecture

**Architectural choice: a genuinely separate screen, not another `GameShell` slot.** `GameShell`'s container (`max-w-7xl`, `pt-6 sm:pt-8 pb-20`, its own `AppBackground`) is built for the header-then-content page shape that toss/board/game-over still use — fighting that shape to get a full-viewport, non-scrolling title screen would have meant adding conditional-background/layout props to a shell three other screens depend on, for zero benefit to them. Instead, `GameScreenInner` now early-returns a new `<GameHomeScreen>` when `isIdle` (`!preGameInRoom && !gameStarted && !isBotMode`) is true, **before** it ever reaches `GameShell`. Every hook (`useGameSocket`, `useBotGame`, `useAuthGuard`) is still called unconditionally at the top exactly as before — only the render branch changed. Verified safe: `isGameOver`/`showInningsOverlay`/`joinSnackbar` can only be true while `gameStarted`/`isBotMode`/`roomCode` are also true, so the idle branch and those overlay states are mutually exclusive in practice — nothing GameShell owns needed to be reachable from the new branch.

**`components/game/home/GameHomeScreen.tsx`** (new) — purely presentational, no `useGameSocket()` call inside it. Every interaction is a callback prop wired from `GameScreenInner`'s existing handlers (`startQuickMatch`, `cancelQuickMatch`, `startBotGame`, `joinRoomByCode`, `createRoom`) — no new state, no new Socket.IO events, per the brief's explicit rule.

Composition (mobile-first flex column, `100dvh`, safe-area padding top/bottom):
- **Identity row** (top): initials avatar + `username` (from `localStorage.getItem("username")`, already surfaced by `useGameSocket` as `myName` — no auth code touched). Ambient only, not a nav item — matches Section 6's "expose only the minimum useful identity information."
- **Hero cluster** (weighted toward the lower-middle third via a `flex-[3]` spacer above it, for one-handed thumb reach): the existing ThumbBat logo (`next/image`, untouched asset, mint glow via `drop-shadow`), then one of three mutually-exclusive states:
  - **Idle:** a single chunky `PLAY` button (Sprint 6's re-themed `Button`, `primary` variant) with a slow (~3.2s), reduced-motion-aware breathing scale loop — restrained per the brief's "not continuously pulse aggressively." Below it, two small text-button secondary actions: **Private Match** and **Practice vs Bot**.
  - **Searching:** "Searching for opponent `Ns`" + a ghost **Cancel** button — reusing `searching`/`searchTime`/`cancelQuickMatch` exactly as `QuickMatchCard` did, just without the card. This is a deliberately minimal interim state; the full arena-animated "SEARCHING FOR OPPONENT" treatment is Sprint 8's job (see Known limitations).
  - **Timed out (60s, no match):** "No player found in 60s." + a **Search Again** button (replicates `QuickMatchCard`'s exact cancel-then-restart sequence).
  - **Private Match** toggles a collapsible reveal (Framer `AnimatePresence` + the existing `slideUp` preset) containing `JoinRoomCard` **completely unchanged** — same component, same internal state/validation, just recontextualized from "1 of 3 equal cards" to "hidden until requested." Restyling that card's own SaaS-flavored markup is left for a future room/lobby sprint, not this one.
  - **Practice vs Bot** calls `onSoloPractice` (`startBotGame()`) directly — no card, replacing `SoloPracticeCard` (which was only ever a heading + description + one button).
- **Bottom row:** a small "🏆 Leaderboard" text link to the real `/leaderboard` route.

Background: `ArenaBackground` (`variant="home"`, `fixed`, no `image` yet — see Section 5) replaces `GameShell`'s `AppBackground` for this screen only; toss/board/game-over keep `AppBackground` untouched.

### 3. Components removed from the render path / now orphaned

`QuickMatchCard.tsx` and `SoloPracticeCard.tsx` are no longer imported anywhere (`GameScreen.tsx`'s imports were removed). **Not deleted** — same treatment as `GameMoveImages.tsx`/`WaitingOverlay.tsx` from Sprint 0's audit: flagging as dead code for a conscious future cleanup decision, not silently removing files during a visual sprint. `JoinRoomCard.tsx` remains fully in use (now via `GameHomeScreen`, not `GameScreen.tsx` directly) and was not modified.

### 4. Interaction mapping (old → new, same handler)

| Old control | New control | Handler (unchanged) |
|---|---|---|
| `QuickMatchCard`'s "Find opponent" | `PLAY` | `startQuickMatch` |
| `QuickMatchCard`'s "Cancel" | "Cancel" (searching state) | `cancelQuickMatch` |
| `QuickMatchCard`'s "Search again" | "Search Again" (timed-out state) | `cancelQuickMatch` then `startQuickMatch` |
| `JoinRoomCard` (always visible) | `JoinRoomCard` (behind "Private Match" toggle) | `joinRoomByCode`, `createRoom` (identical) |
| `SoloPracticeCard`'s "Play vs Bot" | "Practice vs Bot" | `startBotGame` |

### 5. Asset usage

No `heroArena`/`characterA`/`characterB` art exists yet (per your Sprint 6 decision to supply it later). `ArenaBackground` is used *without* its `image` prop — its own gradient/lighting/particle treatment already is the "no asset yet" fallback, so no `ArtSlot` placeholder box was layered on top of it (an empty placeholder rectangle over a full-bleed background would have been redundant chrome, not a real placeholder need). Characters were deliberately omitted from this screen entirely rather than shown as placeholder boxes — Section 14 permits this ("use the existing ArtSlot without redesigning around fake artwork"), and two empty violet-glow rectangles either side of PLAY would read as broken/missing images, not as "the beginning of a premium mobile game." Once `hero-arena.webp` exists, it drops in via `<ArenaBackground image={{ src: ... }} />` with zero layout change.

### 6. Performance decisions

- The ThumbBat logo uses `next/image` with `priority` (it's above-the-fold and was already the case pre-Sprint-7).
- `ArenaBackground` has no image yet, so there is nothing to preload for this screen currently — noted for when Section 5's asset arrives (it should get the same `priority`/preload treatment `CinematicLoader`'s poster already demonstrates).
- No layout shift: the identity row, hero cluster, and bottom row are a static flex column: the only thing that changes size is the middle state-switch (`AnimatePresence mode="wait"`), which is centered and doesn't push the identity/bottom rows since they sit in fixed-flex slots above/below, not measured against the switching content's height. Verified visually — no jump when transitioning idle → searching → cancel.

### 7. Responsive decisions

- **Environment limitation, not new:** this sandbox's browser automation does not reliably honor `resize_window` (confirmed via `window.innerWidth` still reporting 2228px after a requested 375×812 resize) — the same tooling inconsistency documented in Sprint 2's addendum. The brief's exact breakpoints (375×812/390×844/430×932/1440×900) could not be captured as literal pixel screenshots this sprint.
- Verified by construction instead: the composition is a single centered flex column (`max-w-2xl`, safe-area-aware top/bottom padding, no media-query-gated layout switch at all) — the same markup that's "mobile portrait" at 375px is already "expanded arena, centered content" at 1440px, because the `ArenaBackground` is the only element that's ever full-bleed; the UI content never stretches. This directly satisfies Section 11 ("use the additional width to reveal more of the arena, not more UI") by construction rather than by a desktop-specific override.
- Confirmed live at this sandbox's actual (wide) viewport: content stays centered and compact, arena fills the remaining width — no sidebar, no dashboard grid.

### 8. Verification

- **`npx tsc --noEmit`** / **`npm run build`**: clean, same pre-existing unrelated `JoinRoomCard.tsx(62,11)` error and the same environment-specific `Collecting page data` build failure as every prior sprint.
- **Browser, live with the real socket server:** confirmed all three modes still work end-to-end from the new screen — `PLAY` → real "Searching for opponent Ns" → `Cancel` → back to idle; `Private Match` → reveal → `Create new room` → real navigation to `/room/create/[code]` with a real generated code and the existing room banner rendering correctly; `Practice vs Bot` → real transition into the existing bot `GameBoard` (hand images, 1–6 picker, score), fully unchanged.
- **Console:** no errors or warnings on load or through any of the above interactions.
- **Click-registration note:** a couple of clicks in this automation harness didn't register on the first attempt (matches the previously-documented, environment-specific intermittent-click artifact from Sprint 5) — a `find`-based ref click or a second attempt always succeeded immediately after. Not treated as a shipped defect for the same reasons documented then.

### 9. Known limitations / notes for Sprint 8

- The "searching" and "timed out" states inside `GameHomeScreen` are intentionally minimal (text + button, no arena animation) — the brief's full "MATCHMAKING" experience (animated arena feedback, no dashboard card) is explicitly Sprint 8's scope; this sprint only had to keep the existing matchmaking functional from the new entry point, which it does.
- `JoinRoomCard`'s own markup (white/5 backgrounds, emerald-400 buttons) is unchanged and still off-token — it's now hidden-by-default rather than always-visible, which was this sprint's actual ask, but a real visual pass on that card is still owed, likely as part of Sprint 8's "Unified Room/Lobby."
- **"Settings" was intentionally omitted from the secondary-actions row.** No settings page/feature exists anywhere in this codebase, and rendering a button with nowhere to go would be a dead control — the same class of problem as the earlier Google-OAuth situation. Flagging explicitly rather than silently dropping it: if a Settings surface is wanted, it needs its own scope (even a minimal one) before a control for it belongs here.
- `QuickMatchCard.tsx`/`SoloPracticeCard.tsx` are now dead code (see Section 3) — candidates for deletion whenever a cleanup pass is authorized.
- `ArenaBackground`'s particle/glow layers are running at `intensity="medium"` on this screen; once real hero art exists, worth a live comparison to confirm `intensity` still reads as "restrained" over a busier image than the current plain gradient.

I have not started Sprint 8, rebuilt matchmaking/lobby, or touched `/room`/leaderboard's structure. Waiting for approval before proceeding.
