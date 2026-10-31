# THUMBBAT — Game Bible

**Purpose of this document:** the single front door into everything else in `/docs`. Read this first, then go deep via the linked documents. This entire set exists to support one decision: **porting ThumbBat to a native Unity mobile client (Android first) while the existing Node/Socket.IO/MongoDB backend stays exactly as it is.**

**Scope of this pass:** discovery, documentation, and architecture proposal only. No Unity project, no gameplay code, no backend changes. See `ARCHITECTURE_REVIEW.md` for what comes after this is reviewed.

---

## EXISTING BEHAVIOR — What ThumbBat is today

ThumbBat is a real-time, two-player, thumb-cricket-inspired competitive game. Two players each privately pick a number 1–6 per round; matching numbers cause a wicket, non-matching numbers score runs for whoever is "batting." It's structured as a simplified, single-inning-pair version of cricket: bat first, then chase a target.

The product today is a Next.js 15 (App Router) web app talking to a separate Node/Express/Socket.IO process, with MongoDB for accounts, match history, and leaderboard data. It supports:

- Google OAuth and legacy username/password authentication
- Real-time 1v1 multiplayer via a FIFO quick-match queue
- Private rooms via a 6-character shareable code
- A fully client-side "practice vs bot" mode with no server involvement
- A public leaderboard ranked by win percentage then high score
- A cinematic video boot sequence before the title screen

**This is the reference implementation, not the target design.** The Unity client will look and feel like a different, more premium product — see `VISUAL_DIRECTION.md` — but the game *mechanics*, *network protocol*, and *backend contracts* documented here are the ground truth the Unity client must reproduce faithfully, per the explicit instruction not to invent new mechanics or protocols.

---

## Document map

| Document | Answers |
|---|---|
| `GAME_RULES.md` | Exactly how a round, an innings, and a match resolve — the authoritative rules `finalizeRound()` implements |
| `GAME_STATES.md` | Every distinct state the game can be in, client-side and server-side, and what triggers each transition |
| `PLAYER_FLOW.md` | The end-to-end journey: boot → auth → home → (matchmaking / private room / practice) → toss → gameplay → result → rematch |
| `NETWORK_PROTOCOL.md` | Every Socket.IO event, its exact payload shape, and which side emits it |
| `BACKEND_CONTRACT.md` | Every REST endpoint, auth contract, and the assumptions the frontend makes about the backend |
| `DATA_MODELS.md` | Every MongoDB collection/schema and what actually writes to it |
| `VISUAL_DIRECTION.md` | The intended *feel* of the Unity product — explicitly not a redesign brief for the existing React UI |
| `ASSET_MANIFEST.md` | What visual/audio assets exist today, what's needed, what's missing |
| `UNITY_ARCHITECTURE.md` | The proposed Unity-side architecture: scenes, C# modules, networking, state management |
| `OPEN_QUESTIONS.md` | Every open question from every document above, in one place, for review |
| `ARCHITECTURE_REVIEW.md` | The synthesis: proposed architecture, risks, unknowns, recommended build order |

---

## EXISTING BEHAVIOR — The five pillars that must not change

Restated here because they're the most important sentence in this whole set: **the Unity client is a new presentation layer over an unchanged backend.**

1. **Socket.IO protocol** — `server/socket-server.ts`. Every event name, payload shape, and timing constant (`ROUND_TIMEOUT_MS`, `DISCONNECT_GRACE_MS`, etc.) is a hard constraint, not a suggestion. Full contract in `NETWORK_PROTOCOL.md`.
2. **Game rules** — `finalizeRound()` in the same file. Full rules in `GAME_RULES.md`.
3. **Authentication** — JWT + bcrypt, Google OAuth via `/api/auth/google`, session token in a cookie the server reads. Full contract in `BACKEND_CONTRACT.md`.
4. **Matchmaking / private rooms** — FIFO queue (`tryMatch()`), 6-char room codes generated **client-side** today (a real architectural detail Unity must replicate or the backend must be asked to change — flagged as an OPEN QUESTION, not silently decided).
5. **Data models** — `User`, `Match`, `VerificationToken` (all active); `Score` (defined, never written to — dead schema). Full detail in `DATA_MODELS.md`.

## ASSUMPTION

- The backend (`server/socket-server.ts` + the Next.js API routes) will continue running as-is, reachable over the network by the Unity client exactly as it's reachable by the browser today (same Socket.IO endpoint, same REST endpoints). No backend redeploy or protocol version is assumed to be introduced for Unity specifically, unless an OPEN QUESTION below is resolved otherwise.
- "Android first" means the initial Unity build target is Android; iOS/other platforms are out of scope for this documentation pass unless noted.

## OPEN QUESTION

- Is the Unity client expected to talk to the *same* backend deployment the web app uses (shared matchmaking pool, same leaderboard, cross-play between web and Unity users), or a separate environment? This materially affects `NETWORK_PROTOCOL.md`/`BACKEND_CONTRACT.md` assumptions and is not decidable from the existing codebase alone.
- Is the existing web app staying live alongside the Unity app, or is Unity the eventual full replacement? Affects whether backend changes (e.g., fixing the client-side room-code-generation architecture) are safe to make at all.
