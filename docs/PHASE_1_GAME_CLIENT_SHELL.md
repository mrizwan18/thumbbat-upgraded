# Phase 1 — Game Client Shell + State Derivation

**Status:** Complete. Per `THUMBBAT_GAME_CLIENT_ARCHITECTURE.md` Section 8 and the Phase 1 kickoff instructions. No screens were redesigned, no backend/Socket.IO/API code was touched, no old components were deleted.

## What was built

All new code lives under `components/game-client/` — a fresh tree, not layered onto anything from the discarded Sprints 1–7 UI.

### 1. Shell + seven layers (`components/game-client/shell/`)

- **`GameClientShell.tsx`** — the fullscreen (`fixed inset-0`, `100dvh`) root. Renders seven stacked `div`s (`world → atmosphere → hud → interaction → feedback → overlay → transition`, back to front) and registers each one's DOM node into a React context via a *pre-memoized map of stable ref callbacks* — see "Bug found and fixed" below for why that phrasing matters.
- **`layerSlots.tsx`** — `WorldLayer`, `AtmosphereLayer`, `HUDLayer`, `InteractionLayer`, `FeedbackLayer`, `OverlayLayer`, `TransitionLayer`. Each is a `createPortal` into the matching shell div. Usable anywhere in the tree under `GameClientShell`, not just as its direct children — this is what makes "possible without rewriting the shell" real: a future Home/Gameplay/Result component contributes to several layers at once just by rendering these slot components, with no shell prop-signature change.

Every layer container defaults to `pointer-events-none` except `interaction`/`overlay`, which default to `pointer-events-auto` on their *content wrapper* (not the container — see bug below).

### 2. State derivation (`components/game-client/state/`)

- **`types.ts`** — the exact ten `GameClientState` values from the approved architecture, plus `GameClientStateInput` (every field named after the real hook field it reads) and `TossPhase` (the exact string literals `useGameSocket` assigns).
- **`deriveGameClientState.ts`** — one pure function, no React, no side effects. Reads `useGameSocket()`/`useBotGame()` output and picks a state. Owns zero state of its own.
- **`useGameClientState.ts`** — thin hook wrapper; the only state *it* owns is the local `overlay` toggle (leaderboard/profile), which isn't derived from anything backend-side.

### 3. Audio/haptics service interfaces (`components/game-client/services/`)

- **`audio.ts`** — `playSfx(name)`, no-op (a `console.debug` in dev only), exactly as instructed. No audio files added.
- **`haptics.ts`** — `haptic(intensity)`. **Deliberately not a no-op** — wired to the real `navigator.vibrate()` Web API, feature-detected and try/caught. No asset file is involved (nothing to "not add yet"), and it costs the same amount of code as a no-op, so this wires the real thing rather than a placeholder. Flagged explicitly in the file's own doc comment in case you'd rather it stay inert like `playSfx` until a later phase — trivial one-line revert if so.

### 4. Debug overlay (`components/game-client/debug/DebugStateOverlay.tsx`)

Hard-gated on `process.env.NODE_ENV === "production"` returning `null` — not a feature flag, it renders nothing at all in a production build. Shows STATE/SOCKET/MATCH/BOT/ROOM as requested. Reads socket connection status via `getSocket()` (the existing exported singleton from `src/lib/socket.ts`) directly, rather than adding a `connected` field to `useGameSocket.ts` — keeps this change from touching any "preserve" file even additively.

### 5. Phase 1 verification harness (`src/app/dev/game-client-shell/page.tsx`)

Not a designed screen — plain HTML wired directly to real, unmodified handlers (`startQuickMatch`, `startBotGame`, `createRoom`, `joinRoomByCode`, `callHeadsOrTails`, `chooseBatOrBowl`, `playMultiplayerMove`, `playBotMove`, `startRoomGame`, `cancelQuickMatch`, `endBotMode`). Its only purpose is proving the shell/state-machine against the real backend. Same treatment as Sprint 6's `/dev/visual-foundation`: dev-only, not covered by `src/middleware.ts` (`/game/:path*` matcher), unlinked. **Needs the same removal/gating decision before production** — flagging again since nothing in Phase 1's scope does that automatically.

## Bug found and fixed during verification

The first version of `GameClientShell` crashed immediately with `Maximum update depth exceeded`. Root cause: each layer's `ref` callback was created inline during render (`ref={registerNode(layer)}`, calling a memoized *factory* but producing a fresh closure every render). React treats a new ref function identity as "detach the old ref, attach the new one" on every render — and since attaching calls `setState`, this became an infinite detach → attach → re-render loop. Fixed by building the entire map of seven stable callbacks once via `useMemo(..., [])`, so each layer's `ref` prop has the same function identity across renders.

A second, separate bug surfaced once the first was fixed: every click on `InteractionLayer` content was silently swallowed. Root cause: the empty (unopened) `OverlayLayer`'s *container* div was `pointer-events: auto` and `z-50` — sitting above `interaction` (`z-30`) — so a full-viewport invisible div blocked every click underneath it even with nothing rendered inside. Fixed by making every layer container `pointer-events-none` unconditionally, and having each slot's content *wrapper* (not the container) opt back into `pointer-events-auto` — `interaction`/`overlay` default to interactive content, everything else defaults to decorative, either overridable per-use via the `interactive` prop.

Both were caught and fixed during this phase's own verification, before being reported as done — not shipped-then-discovered.

## Verification performed

- **`npx tsc --noEmit`**: clean except the same pre-existing, unrelated `JoinRoomCard.tsx(62,11)` error every prior sprint has hit.
- **`npm run build`**: `✓ Compiled successfully`; fails afterward at the same pre-existing, environment-specific `Collecting page data` step for `/api/auth/login`, unrelated (confirmed since Sprint 0.5).
- **Live, against the real socket server**, via the Phase 1 harness:
  - Socket connection: `DebugStateOverlay` read `SOCKET: connected` from the real `getSocket()` singleton.
  - **Bot loop, fully driven by real `useBotGame` state**: `home → match_intro → gameplay` (wicket → innings switch observed live, HUD score updated) `→ result` (`"Rizzwon (Bot) Wins"`, real score) `→ home` (via `endBotMode()`).
  - **Quick Match**: `home → matchmaking` (`queue:join` fired, debug overlay showed `searching=true`) `→` Cancel `→ home`.
  - **Private room**: `home →` Create Room `→ private_lobby` with a real server-generated code (`isHost=true`, `roomReady=false` while waiting for a second player).
  - **Leaderboard overlay**: opened from Home, `STATE: leaderboard`, arena visible behind it (dimmed, not replaced); Close returned to `home`.
  - **Deep link**: navigated directly to `/room/create/TEST123` (the old, completely untouched route) — rendered exactly as before Phase 1, proving no regression.
  - **Auth guard**: cleared the token, reloaded `/dev/game-client-shell` — redirected to `/login?next=/dev/game-client-shell`, exactly as `useAuthGuard` has always done.
  - **Console**: no errors on load or through any interaction above.
- **No backend files modified**: confirmed via `git status` — the only pre-existing modified files (`server/package.json`, `room-route-client.tsx`, etc.) predate this session entirely (present in the very first git-status snapshot before any sprint work began); Phase 1 added zero new modifications to any file under `server/**`, `src/app/api/**`, `src/middleware.ts`, or either game-state hook.

## Files created

```
components/game-client/shell/GameClientShell.tsx
components/game-client/shell/layerSlots.tsx
components/game-client/state/types.ts
components/game-client/state/deriveGameClientState.ts
components/game-client/state/useGameClientState.ts
components/game-client/services/audio.ts
components/game-client/services/haptics.ts
components/game-client/debug/DebugStateOverlay.tsx
src/app/dev/game-client-shell/page.tsx
docs/PHASE_1_GAME_CLIENT_SHELL.md   (this file)
```

**Files modified:** none outside the above (no existing file was edited for Phase 1 — `useGameSocket.ts`, `useBotGame.ts`, `useAuthGuard.ts`, `src/middleware.ts`, and everything under `server/**`/`src/app/api/**` are byte-identical to before this phase).

**Files deleted:** none — nothing from the Section 3 discard list has been removed yet, per instruction.

## Known limitations / notes for Phase 2

- **Multiplayer has no client-side "return to idle" reset.** The bot loop's `endBotMode()` cleanly returns to `home`; multiplayer's equivalent doesn't exist in `useGameSocket` today (the old `GameScreen.tsx` used `window.location.href = "/"` — a full reload, not a state reset). The Phase 1 harness's multiplayer Result screen does the same full-reload stopgap and says so on-screen. This is real, pre-existing scope for the Result phase, not something Phase 1 was asked to fix — flagging so it doesn't get lost.
- **`match_intro` for multiplayer is not visually verified end-to-end in this phase** — verifying the toss call/choice buttons would need a second browser session to be the opponent; Phase 1's job was the shell/derivation architecture, not a full two-player pass. The bot half of `match_intro` (the 1400ms popup window) *was* verified live.
- The two bugs in this phase (render loop, click-blocking) are exactly the kind of thing a "do not make it visually beautiful yet" phase should surface — a shell bug found now, before four future phases build on top of it, is far cheaper than the same bug found in Phase 5.

Waiting for review before Phase 2.
