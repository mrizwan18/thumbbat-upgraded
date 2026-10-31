import type { GameClientState, GameClientStateInput, OverlayState } from "./types";

/**
 * Pure derivation — no React, no side effects, safe to call from anywhere
 * (the hook below, tests, the debug overlay). This is the entire "state
 * machine": it never sets any new state of its own, it reads what
 * `useGameSocket()`/`useBotGame()` already compute and picks one of the
 * ten `GameClientState` values.
 *
 * Order matters and mirrors the real hook semantics, not just enum
 * priority:
 *   1. game-over wins over everything — `gameStarted`/`isBotMode` stay
 *      true while the result is showing (the board renders behind the
 *      old GameOverModal today), so this must be checked before either.
 *   2. bot mode is a closed loop (`showGameStartPopup` -> gameplay ->
 *      `botGameOver`) with no toss phase of its own — checked as its own
 *      branch rather than folded into the multiplayer toss check.
 *   3. multiplayer: gameStarted -> toss (match_intro) -> room
 *      (private_lobby) -> searching (matchmaking) -> home.
 *      `tossPhase` only resets to "idle" on the next `match:found`, so it
 *      can still read "done" long after a game ends — irrelevant here
 *      because game-over and gameStarted are both checked first.
 */
export function deriveGameClientState(
  input: GameClientStateInput,
  overlay: OverlayState = null
): GameClientState {
  if (!input.bootComplete) return "boot";
  if (!input.isAuthenticated) return "auth";

  const gameOver = input.isBotMode ? input.botGameOver : input.isGameOver;
  if (gameOver) return "result";

  // Overlay (leaderboard/profile) only makes sense once the boot/auth/
  // result gates above are clear — it's a Home-adjacent UI toggle, not a
  // state that should be reachable mid-match.
  if (overlay) return overlay;

  if (input.isBotMode) {
    return input.showGameStartPopup ? "match_intro" : "gameplay";
  }

  if (input.gameStarted) return "gameplay";

  const inToss = input.tossPhase !== "idle" && input.tossPhase !== "done";
  if (inToss) return "match_intro";

  if (input.preGameInRoom) return "private_lobby";
  if (input.searching) return "matchmaking";

  return "home";
}
