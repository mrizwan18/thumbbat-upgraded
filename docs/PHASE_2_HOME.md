# Phase 2 — THUMBBAT Home / Title Screen

**Status:** Complete. `/game` now renders through `GameClientShell` in production for every derived state — Home is the real, designed deliverable; matchmaking/match_intro/gameplay/result are intentionally bare placeholders per explicit instruction, not built out this phase.

Screenshots: `docs/design/screenshots/10-phase2-home.jpg`, `11-phase2-private-match-entry.jpg`, `12-phase2-private-lobby-real-room.jpg`.

## Files created

```
components/game-client/world/assetManifest.ts
components/game-client/world/ArenaWorld.tsx          (ArenaBackdrop, ArenaAtmosphere, CricketBallGlyph)
components/game-client/controls/PlayButton.tsx
components/game-client/states/HomeState.tsx
components/game-client/states/MinimalStatePlaceholder.tsx
components/game-client/overlays/PrivateMatchOverlay.tsx
components/game-client/overlays/LeaderboardOverlay.tsx
components/game-client/overlays/ProfileOverlay.tsx
components/game-client/GameClient.tsx                 (top-level orchestrator)
docs/PHASE_2_HOME.md                                  (this file)
```

## Files modified

- **`src/app/game/GameScreen.tsx`** — now renders `<GameClient />` instead of the old `GameScreenInner`/`GameShell`/`GameHomeScreen` tree. This is the one required change to a route file: Phase 2's architectural rule ("Home must render through GameClientShell... do not create another independent fullscreen page tree") means `/game`'s actual production entry had to switch over now, not just a dev harness. The pre-reset components (`GameShell.tsx`, `GameHomeScreen.tsx`, `TossOverlay.tsx`, `GameBoard.tsx`, `GameOverModal.tsx`, ...) are untouched on disk, simply no longer imported from this file.
- **`styles/globals.css`** — added one keyframe, `tb-bloom-sweep` (a slow opacity/position pulse for `ArenaAtmosphere`'s light bloom). Additive only; nothing existing changed.

**Files modified outside `components/game-client/` and the two above:** none. **Backend/API/Socket.IO/middleware files modified:** none — confirmed via `git status`.

## What was built

### Home (the real deliverable)

`HomeState.tsx` composes entirely through shell layer slots:
- **WorldLayer** — `ArenaBackdrop`: deep-indigo base, mint/cyan floodlight cones, violet ambient glow, optional `arenaHome` image slot (unused until supplied).
- **AtmosphereLayer** — `ArenaAtmosphere`: capped CSS particle drift (reusing the `tb-particle-drift` keyframe from Sprint 6's token work — a generic animation utility, not a reuse of any discarded component) plus the new light-bloom sweep. `useReducedMotion`-aware.
- **HUDLayer** — identity (avatar initials + username) at top-left, two isolated circular icon controls (🏆 leaderboard, ⚙ profile) at top-right — not a nav bar, two independent controls.
- **InteractionLayer** — logo + a small hand-drawn cricket-ball glyph accent, `PlayButton`, and the Private Match / Practice secondary row.
- **OverlayLayer** — `PrivateMatchOverlay` / `LeaderboardOverlay` / `ProfileOverlay`, each a bottom-sheet-on-mobile/centered-card-on-desktop panel over a dimmed (not replaced) arena.

`PlayButton` uses the shared `Button` as its technical base (press mechanics, loading/disabled handling) per the explicit instruction, with a fully custom visual treatment: slow breathing scale+glow at idle, a quick scale-overshoot "punch" on press (separate from the physical compression), `haptic("medium")` + `playSfx("button_press")` fired from the new Phase 1 service stubs.

`GameClient.tsx` also adds a **transition flash**: whenever the derived state actually changes, a brief black fade plays in `TransitionLayer`, so moving between states reads as a transition rather than a page swap — the one piece of "Matchmaking" this phase was allowed to touch (the *transition into it*, not the screen itself).

### Matchmaking / Match Intro / Gameplay / Result (intentionally bare)

`MinimalStatePlaceholder.tsx` — plain text and unstyled buttons, wired to the exact same real handlers as Home (`cancelQuickMatch`, `callHeadsOrTails`, `chooseBatOrBowl`, `playMultiplayerMove`, `playBotMove`). No design investment, per explicit instruction not to proceed past Home this phase.

### Private Match — a game-world overlay, not a separate lobby screen

There is no dedicated `private_lobby` *screen* yet. `HomeState` renders Home's World/Atmosphere/HUD regardless of whether the derived state is `home` or `private_lobby`, and `PrivateMatchOverlay` switches between its code-entry view (no room yet) and its waiting-room view (room exists) based on `inRoom`. This was the pragmatic reading of "do not proceed to... Private Lobby" (not listed in the explicit do-not-build list, but also not asked for as its own screen) alongside "Private Match should open as a game-world overlay" — one overlay serves both sub-states of the same Home world.

### Leaderboard / Profile — real, minimal

`LeaderboardOverlay` calls the existing `/api/leaderboard` endpoint verbatim (no backend change) and renders a plain ranked list — not a redesign of the old podium page, out of this phase's scope. `ProfileOverlay` is identity + Sign Out only; no settings feature exists anywhere in this codebase (flagged in Sprint 7 and Phase 1 too), so nothing was invented for it here.

## Two real bugs found and fixed during verification

1. **HUD clicks silently blocked.** `InteractionLayer` (z-30) sits above `HUDLayer` (z-20). Its content included a `flex-[3]` spacer div with no visible content — but since the layer's content wrapper defaults to `pointer-events-auto`, that invisible spacer inherited it and sat on top of the HUD's leaderboard/profile buttons across the whole top of the screen, eating every click meant for them. Same root-cause family as Phase 1's overlay-layer bug (an interactive layer's non-content regions must not silently capture pointer events), different location. Fixed by making the layer's outer column `pointer-events-none` and re-enabling `pointer-events-auto` only on the actual hero-cluster div that contains real controls.
2. Confirmed (not a new bug, but worth restating): the browser-cache staleness documented in Phase 1 recurred several times during this phase's testing too — a hard reload (`Ctrl+Shift+R`) was needed after each source edit to see the fix rather than a cached error overlay. Purely a sandbox/dev-server artifact, not a code issue.

## Verification performed

- **`npx tsc --noEmit`**: clean except the same pre-existing, unrelated `JoinRoomCard.tsx(62,11)` error.
- **`npm run build`**: `✓ Compiled successfully`; same pre-existing `Collecting page data` failure for `/api/auth/login`, unrelated.
- **Live, on the real production `/game` route, against the real socket server:**
  1. `/game` renders Home through `GameClientShell` — confirmed (`DebugStateOverlay` shows `STATE: home`, `SOCKET: connected`).
  2. PLAY → real `queue:join`, `STATE: matchmaking`, real elapsed search timer.
  3. Private Match → Create New Room → real server-generated code (`2U7V56`), `STATE: private_lobby`, `isHost=true`, `Start Game` correctly disabled until a second player joins.
  4. Practice → real transition to `STATE: gameplay` via `useBotGame`.
  5. Leaderboard opens as an overlay (`STATE: leaderboard`) without leaving `/game`; real `/api/leaderboard` call, correctly surfaced the real "Database connection failed" error (MongoDB unreachable in this sandbox — same documented limitation as every prior sprint, not a new issue); Close returns to `home`.
  6. Profile opens (`STATE: profile_settings`), shows identity + Sign Out, Close returns to `home` without disturbing anything.
  7. Auth guard: cleared the token, reloaded `/game` — redirected to `/login?next=/game`, unchanged.
  8. No Socket.IO events changed — confirmed by code review; every call site uses an existing emit/handler.
  9. No backend files modified — confirmed via `git status`.
  10. No old gameplay logic duplicated — `MinimalStatePlaceholder` and `HomeState` call the same hook functions Phase 1 verified, nothing reimplemented.
  11. No layout shift observed — nothing here loads a binary asset yet (arena is 100% code-generated gradients/particles; the logo uses `next/image` with `priority`, same as every prior sprint), so there was nothing to shift.
  12/13. Mobile-first construction (safe-area padding, centered flex, no breakpoint-gated layout switch) verified by code; **pixel-exact 390×844 screenshots were not obtainable** — this sandbox's browser automation does not reliably honor `resize_window` (same tooling limitation documented in Sprint 2 and Phase 1). Desktop confirmed working at this sandbox's actual (wide) viewport — arena fills the width, UI stays centered and compact, no sidebar/dashboard grid.
  14. Build/typecheck at the known baseline — confirmed above.
- **Console:** no errors through any of the above.

## Performance observations

- Zero binary assets are loaded for Home today — the entire visual is CSS gradients, CSS particles, and the pre-existing logo PNG (`priority`-loaded). There is currently nothing to preload/poster-fallback/reserve-dimensions *for*, by construction. This will become the real test once Phase 8 (asset swap-in) drops in `arenaHome`/character art — the `AssetSlotSpec`/manifest architecture exists specifically so that swap doesn't require revisiting this phase's layout.
- The transition flash and particle drift are pure `opacity`/`transform`, no layout-triggering properties.

## Known limitations

- **No client-side "leave room" handler exists** (`useGameSocket` doesn't expose one, even though the server supports `room:leave`) — per instruction not to touch backend/socket logic, `PrivateMatchOverlay` simply doesn't offer a dismiss affordance once a room exists (`onClose` is `undefined` in that state) rather than a broken one. Same category as the "no multiplayer return-to-home" gap Phase 1 already flagged.
- **Multiplayer Play Again / Home still has no clean reset** (Phase 1's flagged gap, unchanged) — `GameClient.tsx`'s `handlePlayAgain`/`handleGoHome` fall back to `router.push("/game")` (a real navigation, not a state reset) for the multiplayer case; the bot case uses the real `startBotGame()`/`endBotMode()`.
- **Mobile viewport could not be pixel-verified** in this sandbox (tooling limitation, not a code gap) — the composition is mobile-first by construction (safe-area insets, no desktop-only overrides) but a real device/simulator check is worth doing outside this environment before shipping.
- `/dev/game-client-shell` (Phase 1's harness) still exists and is now redundant with the real `/game` route — candidate for removal in a future cleanup pass, not touched this phase.

## Exact asset slots still required

From `components/game-client/world/assetManifest.ts` — none are blocking (Home works and reads as a real title screen without them), all are ready to receive a `src` with zero layout change:

| Slot | Kind | Aspect | Status |
|---|---|---|---|
| `arenaHome` | image | 9:16 (portrait-first) | Not supplied — `ArenaBackdrop`'s code-generated gradient/lighting is the current visual |
| `characterPlayer` | image (transparent) | 3:4 | Not supplied — intentionally not rendered as a placeholder box (non-flow decorative element, nothing to reserve; see Section 5 of the code comments) |
| `characterOpponent` | image (transparent) | 3:4 | Same as above |
| `cricketBall` | image | 1:1 | Not supplied — a hand-drawn SVG (`CricketBallGlyph`) stands in as a real, finished decorative accent, not a placeholder |

Waiting for review before Phase 3.
