# THUMBBAT — Unity Architecture (Proposal)

**Everything in this document is a proposal, not a decision.** Nothing here has been implemented. It is scoped tightly to what the discovery in `NETWORK_PROTOCOL.md`, `GAME_RULES.md`, `GAME_STATES.md`, and `BACKEND_CONTRACT.md` actually supports — it does not invent networking protocols, gameplay mechanics, or backend behavior. Where a proposal depends on something not yet decided, it's cross-referenced to `OPEN_QUESTIONS.md` rather than silently assumed.

---

## 1. Scene structure (proposal)

A single persistent scene plus additive sub-scenes, mirroring the "one shell, many states" shape a prior pass of this same project already validated in the (superseded) React rebuild — not because Unity needs to copy that code, but because the *state list* it derived (`GAME_STATES.md`) is a faithful description of the existing product and is a reasonable scene boundary either way.

```
Boot.unity            — persistent, loads first. Owns:
                          - NetworkManager (Socket.IO client wrapper)
                          - AuthManager
                          - GameStateMachine
                          - AudioManager / SceneLoader (additive)
Home.unity             (additive over Boot, unloaded once leaving Home)
Matchmaking.unity      (additive)
PrivateLobby.unity     (additive) — code entry / waiting-room / opponent-joined / start
MatchIntro.unity       (additive) — toss ceremony
Gameplay.unity         (additive) — the highest-priority scene per this phase's brief
Result.unity           (additive) — victory / defeat / walkover, same scene, different visual state
Leaderboard.unity      (additive, reachable as an overlay from Home without a hard scene transition, if Unity's UI stack supports it — see Section 4)
```

Boot never unloads for the lifetime of the app session — it's where the persistent network connection and auth session live, so a scene transition never has to re-establish the Socket.IO connection.

## 2. C# module structure (proposal)

Organized by responsibility, matching the discovery documents 1:1 so a reviewer can trace every module back to the behavior it's replicating:

```
Assets/Scripts/
  Network/
    SocketClient.cs         — thin wrapper over a Socket.IO C# client library (see Section 5 — OPEN QUESTION on library choice)
    NetworkEvents.cs        — typed event definitions matching NETWORK_PROTOCOL.md exactly (event name constants + payload structs)
    ReconnectService.cs     — implements resume:join / state:snapshot / state:pregame — NEW client-side usage of an EXISTING server capability (see GAME_STATES.md)
  Auth/
    AuthService.cs          — REST calls to /api/auth/*, per BACKEND_CONTRACT.md
    SessionStore.cs         — JWT storage (Unity PlayerPrefs or a secure store — see Section 6)
  Game/
    GameStateMachine.cs     — the 10-state enum from GAME_STATES.md, transition rules from the same source
    RoundController.cs      — client-side reveal/animation timing (CLIENT_ANIMATION_MS-equivalent), NEVER computes outcomes itself
    TossController.cs       — toss ceremony state, mirrors resolveToss()/finalizeChoice() client-side flow (display only, server-authoritative)
    OutcomeFeedback.cs       — consumes the `outcome` field already sent by the server and currently unused by the web client (GAME_RULES.md) — drives FOUR!/OUT!/etc. feedback
    BotOpponent.cs           — OPEN: whether this reimplements useBotGame.ts's probability matrix or is new (see OPEN_QUESTIONS.md)
  UI/
    HomeScreen.cs, MatchmakingScreen.cs, PrivateLobbyScreen.cs, GameplayHUD.cs, ResultScreen.cs, LeaderboardScreen.cs
    GestureControl.cs        — the 1–6 input mechanism, presentation only, emits a plain "player picked N" event
  Data/
    UserProfile.cs           — mirrors the real User schema fields (DATA_MODELS.md) — no fields invented beyond what the backend actually has
  Audio/ (empty until ASSET_MANIFEST.md's audio gap is resolved)
```

## 3. State management (proposal)

`GameStateMachine.cs` implements the ten states from `GAME_STATES.md` as an explicit enum, driven by the same *inputs* the web client derives its states from — not reinvented state, just a typed version of the same derivation:

```csharp
enum GameClientState {
    Boot, Auth, Home, Matchmaking, PrivateLobby,
    MatchIntro, Gameplay, Result, Leaderboard, ProfileSettings
}
```

The state machine is a pure function of network events (toss/room/round events) plus a small amount of local UI-only state (which overlay is open) — mirroring the "derive, don't duplicate" principle the prior React attempt already established and validated. This is presentation architecture, explicitly not a reimplementation of `finalizeRound()` or any other server-authoritative logic.

## 4. UI architecture (proposal)

Unity UI Toolkit (UI Elements) or a Canvas-based uGUI approach — **not decided here**, flagged in `OPEN_QUESTIONS.md`/`ARCHITECTURE_REVIEW.md` as a real technical fork with real tradeoffs (UI Toolkit: better for data-driven, DPI-independent mobile UI, steeper learning curve if the team isn't already using it; uGUI: more examples/asset-store support, more manual DPI/anchor work). Whichever is chosen, the UI is proposed to be structured as **presentation components driven by the state machine**, not by direct network-event handlers — i.e., `GameplayHUD.cs` reads `GameStateMachine.CurrentState` and the round data it exposes, it does not itself listen to `move:roundResult`.

Given "UI should be embedded into the game world" (`VISUAL_DIRECTION.md`), overlays (Leaderboard, Private Match code entry) are proposed as world-space or screen-space-camera canvases layered over a persistent 3D/2D environment, not full scene swaps — this avoids the "empty dark background with a centered HTML component" failure mode explicitly called out as something to avoid, translated to Unity terms (avoid "empty scene with a centered Canvas panel").

## 5. Networking architecture (proposal)

**OPEN QUESTION, load-bearing:** there is no first-party Socket.IO client for Unity/C#. Real options, none chosen here:
- A third-party Socket.IO-protocol-compatible C# library (several exist on GitHub/Asset Store; engineering-quality varies, needs real evaluation, not assumed).
- A raw WebSocket connection to a *new*, Unity-facing endpoint that speaks a simpler protocol, with a translation layer added to the existing Node server — this would be a **backend change**, explicitly out of this phase's scope to decide unilaterally (`GAME_BIBLE.md`'s five pillars).
- Engine.IO/Socket.IO protocol reimplemented directly (highest effort, most control).

Given `allowEIO3: true` is already set server-side (Engine.IO v3 compatibility), whichever library is chosen needs to confirm it speaks a compatible protocol version — this is a concrete technical compatibility check, not a preference.

Regardless of library choice, the proposed architecture is: **`SocketClient.cs` is the only place that touches the wire protocol.** Every event name and payload shape it uses comes directly from `NETWORK_PROTOCOL.md`. No gameplay code anywhere else in the Unity project talks to the socket directly.

## 6. Auth architecture (proposal)

`AuthService.cs` calls the existing REST endpoints (`BACKEND_CONTRACT.md`) directly over HTTPS. Google Sign-In on Android would use Unity's Google Sign-In SDK (or Android's native Credential Manager) to obtain an access token, then POST it to the existing `/api/auth/google` endpoint exactly as the web client does — **this is the one piece of the existing contract that's genuinely designed for exactly this reuse** (the endpoint already accepts a bare access token, not a browser-specific artifact).

The JWT itself: proposed storage is Unity's encrypted `PlayerPrefs` or Android Keystore-backed secure storage (not plain PlayerPrefs, which is not encrypted at rest) — flagged as a security decision, not asserted as already solved. The **bearer-token-on-every-request** pattern this implies is not yet supported by the backend (see `BACKEND_CONTRACT.md`'s open question) — this is a real dependency this Unity architecture has on a backend change that hasn't been scoped or approved.

## 7. Asset architecture (proposal)

Unity Addressables, keyed by the slot names already established in `ASSET_MANIFEST.md` (`arena-home`, `character-player`, etc.) so that dropping in real art later is an Addressables content update, not a code change — directly mirroring the "asset-slot" principle a prior pass of this project already used successfully for the web rebuild's placeholder strategy. Until real art exists, every slot resolves to a clearly-labeled neutral placeholder (a flat color/simple shape, explicitly not a fake illustrated stand-in, matching this project's own established convention of never letting a placeholder pretend to be final art).

## 8. Android build strategy (proposal)

- **Minimum API level / target API level:** not specified anywhere in the existing project (which is a pure web app) — genuinely new territory, needs a real decision informed by current Android distribution data at build time, not guessed here.
- **IL2CPP vs Mono scripting backend:** IL2CPP is the standard recommendation for Android release builds (performance, and Mono is being phased out for some Unity versions on Android) — a real recommendation, not a hard requirement documented anywhere in this existing project (there is nothing to discover here; it's a Unity-ecosystem default).
- **Networking permissions:** `INTERNET` (required for both REST and WebSocket/Socket.IO traffic).
- **Signing/release pipeline, Play Store metadata, target Unity version:** all genuinely undecided, not addressed by this documentation pass — see `OPEN_QUESTIONS.md`.

## OPEN QUESTION

- UI Toolkit vs uGUI — real fork, not decided.
- Socket.IO client library choice for C# — real fork, not decided, and load-bearing for the entire networking layer.
- Whether a backend change is in scope to support bearer-token REST auth (currently unsupported) — blocks a clean auth architecture otherwise.
- Target Unity LTS version, minimum Android API level, IL2CPP toolchain specifics — none addressed, all genuinely open.
