# THUMBBAT — Data Models

MongoDB via Mongoose. Four schemas exist; one is dead. Nothing here needs to change for Unity — this document exists so the Unity/backend integration layer knows exactly what shape of data it's reading, without guessing.

---

## EXISTING BEHAVIOR — `User` (`server/models/User.ts`)

```ts
{
  username: String,        // required, unique
  email: String,           // required, unique
  password: String,        // required — bcrypt hash. Google-only accounts get a random, unusable hash here (no real password)
  isConfirmed: Boolean,     // default false
  confirmationToken: String,// legacy plaintext field — superseded by VerificationToken, still present on the schema
  highScore: Number,        // default 0 — max score ever achieved in a single match, updated via $max
  wins: Number,             // default 0
  losses: Number,           // default 0
  winPercentage: Number,    // default 0 — recomputed as round(wins / (wins+losses) * 100) after every match
  emailVerifiedAt: Date,    // default null
}
```

No `avatar`, no `displayName` distinct from `username`, no profile fields of any kind beyond the above. **There is no schema support today for anything a "Profile" screen would show beyond username/win-loss/high-score** — confirmed by reading the full schema, not inferred.

## EXISTING BEHAVIOR — `Match` (`server/models/Match.ts`)

```ts
{
  roomId: String,           // indexed
  players: [
    { user: ObjectId|null, username: String, socketId: String }, // exactly 2 entries
  ],
  aScore: Number,
  bScore: Number,
  target: Number|null,
  winner: { user: ObjectId|null, username: String },
  loser:  { user: ObjectId|null, username: String },
  reason: String,           // "chaseComplete" | "wicketSecondInnings" | "walkover" | "timeout" | "manual" (comment in source; "timeout"/"manual" values are documented in the comment but not observed being written by any code path read during this pass — see OPEN QUESTION)
  firstInningScore: Number|null,
  startedAt: Date,
  endedAt: Date,
  // + Mongoose timestamps: createdAt, updatedAt
}
```

Written **only** by `persistMatch()` in `server/socket-server.ts`, called from exactly two places: a normal game-over inside `finalizeRound()` (reason = the outcome's `type`, i.e. `"chaseComplete"` or `"wicketSecondInnings"`), and the disconnect-timeout walkover path (reason = `"walkover"`). Bot/practice matches are **never** persisted here — no `Match` document is ever created for a bot game, since bot mode never touches the socket server at all.

## OPEN QUESTION

- The `reason` field's own code comment lists `"timeout"` and `"manual"` as possible values, but no code path in `server/socket-server.ts` actually writes either of those strings — every real write is `"chaseComplete"`, `"wicketSecondInnings"`, or `"walkover"`. Is this aspirational (a future distinction that was never implemented) or dead documentation? Not resolved here.

## EXISTING BEHAVIOR — `VerificationToken` (`server/models/VerificationToken.ts`)

```ts
{
  userId: ObjectId,    // required
  email: String,       // required
  tokenHash: String,   // required, unique — SHA-256 of the plaintext token mailed to the user
  expiresAt: Date,     // required — TTL-indexed, MongoDB auto-deletes expired docs
  usedAt: Date|null,
}
```

Purely a signup-email-confirmation mechanism. Not relevant to gameplay; included for completeness since it's a real, active collection.

## EXISTING BEHAVIOR — `Score` (`server/models/Score.ts`) — dead schema

```ts
{
  userId: ObjectId,
  score: Number,
  createdAt: Date,
}
```

**Confirmed via repo-wide search: zero code anywhere creates, reads, updates, or deletes a `Score` document.** The model file exists and is syntactically valid, but nothing imports it. This is dead weight in the schema, not an active part of the data model — flagged so it isn't mistaken for a real leaderboard-history mechanism (the actual leaderboard is computed live from `User.highScore`/`winPercentage`, not from any per-match `Score` log).

## ASSUMPTION

- Unity does not need its own local persistent data model beyond session/auth caching (JWT, username) and whatever client-side prediction/replay buffer its networking layer needs — all durable game data (accounts, match history, leaderboard) is assumed to remain server-authoritative in MongoDB, unchanged. No offline-play-with-later-sync model is assumed unless explicitly requested.

## OPEN QUESTION

- Should the dead `Score` model be revived for a per-match history feature (e.g., a "recent matches" list a mobile profile screen might want), or deleted as cleanup? Not decided here — flagged as a real design fork for whoever scopes the "Profile" surface `GAME_STATES.md` notes doesn't exist yet in any form.
