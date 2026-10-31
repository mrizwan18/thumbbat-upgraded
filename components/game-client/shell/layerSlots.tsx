"use client";

import React, { useContext } from "react";
import { createPortal } from "react-dom";
import { LayerNodesContext, type LayerName } from "./GameClientShell";
import { cx } from "@/components/ui/cx";

export interface LayerSlotProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Override this slot's default pointer-events behavior. Every layer
   * container is `pointer-events-none` (see GameClientShell.tsx) — each
   * slot's *content wrapper* opts back in via this prop, defaulting to
   * `true` for interaction/overlay (where content is expected to be
   * clickable) and `false` everywhere else (decorative by default).
   * `pointer-events` is inherited, so setting it here on the
   * `display: contents` wrapper reaches real children even though the
   * wrapper itself contributes no box.
   */
  interactive?: boolean;
}

/**
 * One slot component per layer, each a thin portal into the matching div
 * `GameClientShell` renders. Returns `null` until the shell has mounted
 * and attached its ref (one extra render, imperceptible) — never throws if
 * used outside a shell, it just renders nothing, so a state component
 * under construction can't crash the app by forgetting the shell exists.
 */
function makeLayerSlot(layer: LayerName, defaultInteractive: boolean) {
  function LayerSlot({ children, className, interactive = defaultInteractive }: LayerSlotProps) {
    const nodes = useContext(LayerNodesContext);
    const target = nodes[layer];
    if (!target) return null;
    return createPortal(
      <div className={cx("contents", interactive && "pointer-events-auto", className)}>{children}</div>,
      target
    );
  }
  LayerSlot.displayName = `${layer[0].toUpperCase()}${layer.slice(1)}Layer`;
  return LayerSlot;
}

/** Fullscreen environment — video/image/particles. Decorative by default; pass `interactive` if the world itself needs a tap target. */
export const WorldLayer = makeLayerSlot("world", false);
/** Ambient motion layered over the world — fog, light sweeps, particles. Never intercepts taps. */
export const AtmosphereLayer = makeLayerSlot("atmosphere", false);
/** Persistent-but-unobtrusive chrome — score, identity, timer. Never intercepts taps by default. */
export const HUDLayer = makeLayerSlot("hud", false);
/** The thing the player is actually touching right now — PLAY, gesture controls, Cancel, etc. Interactive by default. */
export const InteractionLayer = makeLayerSlot("interaction", true);
/** Transient game events — FOUR!/OUT!/VICTORY/etc. Never intercepts taps; these are always momentary. */
export const FeedbackLayer = makeLayerSlot("feedback", false);
/** Private-match sheet, leaderboard, settings — sits above interaction, arena stays visible behind it. Interactive by default. */
export const OverlayLayer = makeLayerSlot("overlay", true);
/** Full-screen wipes/fades between states. Topmost, never intercepts taps (a transition that blocks input is a bug). */
export const TransitionLayer = makeLayerSlot("transition", false);
