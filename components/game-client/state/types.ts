/**
 * The exact ten states from THUMBBAT_GAME_CLIENT_ARCHITECTURE.md Section 5.2.
 * Gameplay events (innings change, gesture reveal, FOUR/SIX/OUT, score
 * change) are NOT states here — they're momentary FeedbackLayer content
 * inside `gameplay`, per the Phase 1 kickoff's explicit instruction.
 */
export type GameClientState =
  | "boot"
  | "auth"
  | "home"
  | "matchmaking"
  | "private_lobby"
  | "match_intro"
  | "gameplay"
  | "result"
  | "leaderboard"
  | "profile_settings";

/** The exact string literals `useGameSocket` assigns to `tossPhase`. */
export type TossPhase =
  | "idle"
  | "calling"
  | "waiting-call"
  | "showing-result"
  | "choosing"
  | "waiting-choice"
  | "done";

/** Local-only UI toggle — not derived from any backend event. */
export type OverlayState = "leaderboard" | "profile_settings" | null;

/**
 * Everything the derivation needs, all of it read (not owned) from the
 * existing hooks. No field here is new state — see
 * `deriveGameClientState.ts` for exactly which hook returns each one.
 */
export interface GameClientStateInput {
  /** True once the boot cinematic has finished. Phase 1 default: true (this shell isn't mounted at `/` yet). */
  bootComplete: boolean;
  /** True once a session is confirmed. Phase 1 default: true (auth-gated routes already redirect otherwise). */
  isAuthenticated: boolean;

  // from useGameSocket()
  preGameInRoom: boolean;
  gameStarted: boolean;
  searching: boolean;
  tossPhase: TossPhase;
  isGameOver: boolean;

  // from useBotGame()
  isBotMode: boolean;
  showGameStartPopup: boolean;
  botGameOver: boolean;
}
