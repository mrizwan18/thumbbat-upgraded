# THUMBBAT — Game Rules

**Source of truth:** `server/socket-server.ts`, specifically `finalizeRound()`, `finalizeChoice()`, and `resolveToss()`. This file is the *only* authority for scoring — the client (web today, Unity tomorrow) never computes an outcome, it only displays what the server already decided. **This must remain true in the Unity port**: Unity is a thin client for these rules, not a reimplementation of them.

There is a second, independent implementation of these exact rules for bot/practice mode (`src/hooks/useBotGame.ts`), which runs entirely client-side with no server involvement. It is a hand-maintained duplicate, not the same code, and has at least one behavioral divergence from the server (see "Bot mode divergence" below).

---

## EXISTING BEHAVIOR — Core mechanic

Each round, both players privately pick a number **1–6**. Neither sees the other's pick until both have picked (or the round times out).

- **If both players pick the same number:** a wicket falls.
- **If the numbers differ:** the batting player's score increases by their own picked number (i.e., you score your own number, not the difference, not the opponent's number).

This is the entire primitive. Everything else is innings/target bookkeeping on top of it.

## EXISTING BEHAVIOR — Innings 1 (setting a total)

- One player bats, one bowls (decided by the toss — see below).
- Same number picked → wicket. Innings 1 ends immediately. `firstInningScore` is locked to the batter's current score. Roles swap (the bowler now bats). `target = firstInningScore + 1`.
- Different numbers → the batter's score increases by their picked number. Innings continues indefinitely (no over limit, no fixed number of balls — the innings only ends on a wicket).

## EXISTING BEHAVIOR — Innings 2 (the chase)

The player who bowled in innings 1 now bats, chasing `target`.

- Same number picked → wicket. The chase ends immediately.
  - If the chaser's score (at the moment of the wicket) is **≥** target, the chaser wins.
  - Otherwise the original batter (now bowling) wins.
  - Note: because scoring only happens on *different* numbers, the chaser's score at a wicket-causing round is whatever it already was — a wicket never itself adds runs.
- Different numbers → the chaser's score increases by their picked number.
  - If the new score **≥** target, the chase is complete — the chaser wins immediately, mid-innings, without needing a wicket.
  - Otherwise the innings continues.

## EXISTING BEHAVIOR — No over/ball limit

Neither innings has a maximum number of rounds. An innings can theoretically run forever if neither a wicket nor the target is reached — there is no "all out after N balls" or "N overs" cap anywhere in `finalizeRound()`. This is a simplified format: **one wicket per side, no limit on balls faced.**

## EXISTING BEHAVIOR — Auto-fill on timeout

Each round has a `ROUND_TIMEOUT_MS` (15,000 ms) deadline. If a player hasn't picked by the deadline, the server assigns them a random move (`randMove()`, uniform 1–6) and resolves the round as normal — a timeout is never a walkover by itself, it's just an involuntary random pick. (Full disconnect/walkover behavior is a separate mechanism — see `GAME_STATES.md`.)

## EXISTING BEHAVIOR — Toss

Before gameplay starts:
1. A caller is chosen at random (`pickRandom`) from the two players.
2. The caller calls heads or tails (`TOSS_CALL_TIMEOUT_MS` = 15,000 ms to respond, else auto-picked randomly).
3. The server independently picks a random outcome (heads or tails) — the call and the outcome are two separate coin flips conceptually; the caller "wins" if their call matches the server's random outcome, otherwise the other player wins.
4. After a fixed `RESULT_REVEAL_MS` (5,000 ms) pause, the toss winner is asked to choose bat or bowl (`CHOICE_TIMEOUT_MS` = 15,000 ms, else auto-picked randomly between the two).
5. Whoever chose (or was assigned) "bat" bats first in innings 1.

## EXISTING BEHAVIOR — Structured outcome data (sent, but unused by the web client)

Every `move:roundResult` includes a structured `outcome` object:

```ts
type Outcome =
  | { type: "runs"; runsAdded: number }
  | { type: "wicketFirstInnings" }
  | { type: "wicketSecondInnings"; winnerId: string | null }
  | { type: "chaseComplete"; winnerId: string }
  | { type: "inningsSwitch" }; // declared in the type union but never actually emitted — see below
```

**Important existing gap:** the web client (`useGameSocket.ts`) receives this field and never reads it — the FOUR!/OUT!/SIX!-style dramatic feedback the Phase 2+ visual direction calls for **does not exist in the current product at all**. This is exactly the data Unity's gameplay feedback should be built from — it's already on the wire, just never consumed. Not a new protocol addition; a client finally reading a field the server already sends.

## EXISTING BEHAVIOR — `inningsSwitch` is declared but never constructed

The `Outcome` type includes an `inningsSwitch` variant, but no code path ever creates one — the actual innings-1-ending wicket is tagged `wicketFirstInnings`, not `inningsSwitch`. Dead type-union member.

## OPEN QUESTION

- Is the no-over-limit format intentional as a permanent design decision, or a placeholder that a "real" version of ThumbBat was always meant to add a ball/over cap to? This is exactly the kind of gameplay-mechanic question the brief says not to decide unilaterally — flagging rather than assuming either answer.

## EXISTING BEHAVIOR — Bot mode divergence (client-side duplicate, `useBotGame.ts`)

The practice/bot mode reimplements the same batting/bowling/innings/target logic independently, entirely in the browser, with no socket involvement. It is **not** the same code as the server, and has at least one confirmed behavioral difference:

- **Draws exist in bot mode, not in multiplayer.** `useBotGame.ts`'s `declareWinner()` explicitly checks `userScore === opponentScore` and can produce `"🟡 It's a Draw!"`. The server's `finalizeRound()` has no equivalent branch — every multiplayer match resolves to a definite `winnerId`. Whether a tie is even reachable under bot mode's specific call sequence is not verified here; the point is the *code path exists* in one implementation and not the other.
- The bot's "AI" is a hand-tuned probability matrix (`baseMatrix`) nudged slightly by recent picks (`adaptMatrix`) — not a real opponent, not a minimax/lookahead system. Reproducing this exact matrix (or replacing it with something else) is a decision for `UNITY_ARCHITECTURE.md`/`OPEN_QUESTIONS.md`, not assumed here.

## OPEN QUESTION

- Should Unity's practice mode reproduce this exact probability matrix (for behavioral parity with the current bot) or is a new bot AI in scope? Marking as open rather than assuming either way, per the instruction not to invent gameplay mechanics.
- Should the draw-capable bot-mode logic and the draw-incapable multiplayer logic be reconciled (same rules, same capabilities) as part of this port, or is the asymmetry intentional/acceptable? Not decided here.
