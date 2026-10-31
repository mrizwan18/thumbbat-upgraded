/**
 * The event architecture for game-feel audio (Phase 1 kickoff, "Audio /
 * Haptics" section). No-op by design — no audio files exist yet. The
 * point is that every future call site (`playSfx("four")` inside the
 * Gameplay state, `playSfx("button_press")` on PLAY, etc.) can be written
 * now and never needs to change when a real implementation lands; only
 * this file does.
 */
export type SfxName =
  | "button_press"
  | "opponent_found"
  | "gesture_select"
  | "number_reveal"
  | "four"
  | "six"
  | "out"
  | "victory"
  | "defeat";

export function playSfx(name: SfxName): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(`[audio] ${name}`);
  }
}
