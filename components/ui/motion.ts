import type { TargetAndTransition } from "framer-motion";

type MotionPreset = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
};

/**
 * Shared ThumbBat motion primitives (Sprint 1).
 *
 * These standardize the handful of transition shapes already used ad hoc
 * across the app (fade/slide/scale-in, card hover, modal/overlay presence)
 * so later sprints reach for one of these instead of inventing a new
 * animation shape per screen. Reduced-motion is handled globally via
 * `<MotionConfig reducedMotion="user">` in the root layout — these variants
 * don't need to duplicate that check.
 *
 * Timing follows the project's motion scale: micro ~150-250ms, UI
 * transitions ~250-400ms, game moments get their own bespoke timing and are
 * out of scope here (see GameMoveVisual's existing phase state machine).
 */

export const fadeIn: MotionPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const slideUp: MotionPreset = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
};

export const slideDown: MotionPreset = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export const scaleIn: MotionPreset = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.18 } },
};

/** Page-level enter transition (marketing/auth/lobby pages). */
export const pageEnter = slideUp;

/** Modal/overlay backdrop presence. */
export const backdropPresence = fadeIn;

/** Modal/overlay content presence (pairs with backdropPresence). */
export const overlayPresence = scaleIn;

/** Dropdown / small popover presence (Navbar user menu, selects, etc.). */
export const popoverPresence = slideDown;

/** Hover lift for interactive cards. */
export const cardHoverProps = {
  whileHover: { y: -4 },
  transition: { type: "spring" as const, stiffness: 300, damping: 20 },
};

/** Press feedback for tactile controls. */
export const pressTapProps = {
  whileTap: { scale: 0.96 },
};

/**
 * ThumbBat motion vocabulary (Sprint 6).
 *
 * Named durations (seconds) so new game-UI components reach for one of
 * these instead of picking arbitrary numbers. Deliberately just five —
 * per the sprint brief, this is not meant to grow into a large utility set.
 *
 *   micro       ~100-150ms  button press, tiny state flips
 *   interaction ~150-220ms  hover/selection response
 *   state       ~250-400ms  panel/overlay enter-exit (existing presets above)
 *   impact      ~400-700ms  gameplay feedback pop ("FOUR!", gesture reveal)
 *   cinematic   ~700ms+     boot/result screen transitions
 */
export const durations = {
  micro: 0.12,
  interaction: 0.2,
  state: 0.32,
  impact: 0.55,
  cinematic: 0.8,
} as const;

/** Slight overshoot easing for punchy, game-like impact moments. */
export const impactEase = [0.34, 1.56, 0.64, 1] as const;

/** One-shot "gesture selected" emphasis — scale + hold, no loop. */
export const gestureSelect: MotionPreset = {
  initial: { scale: 1 },
  animate: { scale: 1.08, transition: { duration: durations.interaction, ease: "easeOut" } },
  exit: { scale: 1, transition: { duration: durations.micro } },
};

/** One-shot impact pop — for gameplay feedback text ("FOUR!", "OUT!"). */
export const impactPop: MotionPreset = {
  initial: { opacity: 0, scale: 0.75 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.impact, ease: impactEase },
  },
  exit: { opacity: 0, transition: { duration: durations.interaction } },
};
