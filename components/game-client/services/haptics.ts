/**
 * The event architecture for haptic feedback (Phase 1 kickoff, "Audio /
 * Haptics" section).
 *
 * Deliberately NOT a pure no-op like `playSfx`, unlike what the brief
 * defaulted to: the Vibration API needs no asset file and is a real,
 * free, best-effort implementation (silently does nothing on unsupported
 * browsers/iOS Safari) — establishing the call sites AND getting real
 * haptic feedback cost the same amount of code, so this wires the real
 * thing. Flagging the deviation explicitly; trivial to revert to a
 * console-only no-op if you'd rather every game-feel hook stay inert
 * until a later phase.
 */
export type HapticIntensity = "light" | "medium" | "heavy";

const PATTERN_MS: Record<HapticIntensity, number> = {
  light: 10,
  medium: 20,
  heavy: 35,
};

export function haptic(intensity: HapticIntensity): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(PATTERN_MS[intensity]);
  } catch {
    // Best-effort only — never let a haptic call break gameplay.
  }
}
