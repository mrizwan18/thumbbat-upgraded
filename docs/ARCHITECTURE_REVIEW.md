# THUMBBAT — Architecture Review

The synthesis document. Full detail for each section lives in the linked document; this is the executive pass — what's being proposed, why, and what could go wrong. **Nothing below is implemented. This is the review artifact for a go/no-go conversation before any Unity project exists.**

---

## Proposed Unity architecture (summary)

A single persistent Boot scene owning the network connection, auth session, and a state machine; additive sub-scenes for each of the ten states derived in `GAME_STATES.md`. Every gameplay rule stays server-authoritative (`GAME_RULES.md`) — Unity is a real-time renderer of server decisions, never a second implementation of `finalizeRound()`. Full detail: `UNITY_ARCHITECTURE.md`.

## Proposed scene structure

`Boot → Home → Matchmaking / PrivateLobby → MatchIntro → Gameplay → Result`, with `Leaderboard` as an overlay rather than a hard scene swap where the UI stack allows it. Mirrors the state list in `GAME_STATES.md` directly — not a new taxonomy, a Unity-shaped version of the one already derived from the existing product's actual behavior.

## Proposed C# module structure

Organized by responsibility and named to trace 1:1 back to a discovery document: `Network/` (wire protocol, matching `NETWORK_PROTOCOL.md` exactly), `Auth/` (REST calls per `BACKEND_CONTRACT.md`), `Game/` (state machine + display-only round/toss controllers — no rule logic), `UI/`, `Data/` (mirrors the real `User` schema fields, no invented profile fields). Full detail: `UNITY_ARCHITECTURE.md` Section 2.

## Proposed state-management approach

One explicit enum (the ten states), driven by network events plus a small amount of local UI-only state (which overlay is open) — the same "derive, don't duplicate" shape a prior pass of this project already validated for the web rebuild. Not gameplay logic; purely which screen/overlay is showing.

## Proposed UI architecture

Deferred choice between UI Toolkit and uGUI (`OPEN_QUESTIONS.md` #23) — both are viable, neither is assumed. Whichever is chosen, UI components read from the state machine rather than listening to network events directly, so the "UI embedded in the game world" principle (`VISUAL_DIRECTION.md`) is enforceable architecturally, not just stylistically.

## Proposed networking architecture

The single highest-risk technical unknown in this whole proposal (see Risks below): there is no first-party Socket.IO client for Unity/C#. A library must be evaluated and chosen, or a backend-side translation layer added (a real backend change, outside this phase's authority to decide alone). Full detail and options: `UNITY_ARCHITECTURE.md` Section 5.

## Proposed asset architecture

Unity Addressables keyed by the exact slot names already established in `ASSET_MANIFEST.md` (`arena-home`, `character-player`, etc.), so real art drops in as a content update, not a code change. Placeholders are neutral and clearly labeled as such, never fake-final-looking — consistent with how this same project has handled every prior "no real asset yet" situation.

## Proposed Android build strategy

IL2CPP scripting backend (standard recommendation, not discovered from this project — there's nothing to discover, it's a Unity-ecosystem default), `INTERNET` permission, target/min API level and signing pipeline all genuinely undecided. Full detail: `UNITY_ARCHITECTURE.md` Section 8.

---

## Risks

1. **Networking library risk (highest).** The entire real-time experience depends on a working Socket.IO-compatible C# client. If no suitable library exists or performs poorly on Android, the fallback (a backend-side protocol translation layer) is a real backend change requiring separate sign-off — this single unknown could reshape the whole networking proposal.
2. **Auth model gap.** No existing REST endpoint checks a bearer token today (`BACKEND_CONTRACT.md`/`OPEN_QUESTIONS.md` #16). Unity cannot have a secure, working auth story without either a backend change or a documented, deliberately-accepted gap. This blocks real device testing against production data, not just a nice-to-have.
3. **Asset timeline risk.** Zero real art exists for any of the six named asset slots. If Unity architecture work proceeds in parallel with art production (recommended below), there's real risk of the two tracks converging on incompatible aspect ratios/formats if the art brief (`VISUAL_DIRECTION.md`) isn't finalized before art production starts.
4. **Bot-logic fidelity risk.** `useBotGame.ts`'s probability matrix is a real, specific, if idiosyncratic algorithm. If Unity's practice mode needs to feel identical (not just "similarly difficulty-tuned"), the exact matrix needs porting, not reapproximating — a decision currently unresolved (`OPEN_QUESTIONS.md` #4).
5. **Reconnect-flow risk (upside, not downside, but real work).** The server already supports resume/reconnect fully; Unity would be the *first* real consumer of it. This is good news architecturally but means it's untested in practice against this specific server code — the first Unity build to exercise it may surface server-side bugs that have never been triggered by any client in production.

## Technical unknowns

- Real-world latency/behavior of whatever Socket.IO C# library is chosen, on real Android hardware, on real mobile networks (not discoverable from source code review alone — needs a spike).
- Whether the existing server's in-memory room state (no Redis, no persistence layer for live game state — confirmed in the original Sprint 0 audit of this project) scales acceptably for a larger Unity-driven player base, or whether it was only ever load-tested implicitly by whatever traffic the web app has seen.
- Exact behavior of `state:snapshot`/`state:pregame` in practice — flagged in `NETWORK_PROTOCOL.md` as possibly-broken/never-exercised. The first real usage (Unity's reconnect flow) may be the first time this code path is actually tested.

## Recommended implementation order

1. **Resolve the two blocking open questions first** (`OPEN_QUESTIONS.md` triage): the networking library choice and the API-auth-model gap. Both are foundational — building UI or gameplay screens before these are settled risks throwaway work.
2. **Spike the networking layer in isolation** — a minimal Unity project that connects to the real dev Socket.IO server, joins the quick-match queue, and completes one full round, with no UI polish at all. This validates the highest-risk unknown before investing in scenes/UI.
3. **Build the auth flow** (Google Sign-In → `/api/auth/google` → JWT storage) once the auth-model question is resolved, since every other flow depends on having a session.
4. **Build Home + Matchmaking + Gameplay + Result as bare, functional scenes** (mirroring how this same project's earlier React-rebuild phases deliberately shipped "bare" placeholder screens for non-priority states before investing in visual polish) — prove the full player loop end-to-end against the real backend before any art exists.
5. **Bring in real art once produced**, dropping into the Addressables slots already wired in step 4 — by design, this should require no architecture changes if steps 1–4 were done correctly.
6. **Private rooms, resume/reconnect, and rematch** last — real features, but each is either lower-frequency (private rooms) or genuinely new client behavior building on a already-proven network layer (resume, rematch), so they benefit from being built once the core loop is solid rather than in parallel with it.

This order is a proposal for review, not a commitment — it exists to make the *sequencing risk* visible (what happens if art, backend, and Unity work proceed out of this order) rather than to lock in a schedule.
