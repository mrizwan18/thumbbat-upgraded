"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cx } from "@/components/ui/cx";

export type ArenaVariant = "home" | "gameplay" | "lobby" | "auth" | "result";
export type ArenaIntensity = "low" | "medium" | "high";
export type ArenaAccent = "mint" | "cyan" | "violet" | "none";

export interface ArenaBackgroundProps {
  /** Semantic hint for future screens/tuning — no required behavior difference today. */
  variant?: ArenaVariant;
  /** Optional backdrop art. Layered under the lighting/vignette, above the base wash. */
  image?: { src: string; alt?: string; priority?: boolean; opacity?: number };
  /** Controls glow strength and particle count — pass "low" for weaker devices. */
  intensity?: ArenaIntensity;
  /** Restrained secondary accent glow (the reference's violet tunnel light). */
  accent?: ArenaAccent;
  vignette?: boolean;
  particles?: boolean;
  /** `fixed` for a whole-viewport backdrop (boot-style); `absolute` (default) to sit behind a bounded section — the parent must be `position: relative`. */
  fixed?: boolean;
  className?: string;
}

const PARTICLE_COUNT: Record<ArenaIntensity, number> = { low: 0, medium: 8, high: 14 };

const ACCENT_RGB: Record<Exclude<ArenaAccent, "none">, string> = {
  mint: "110,231,183",
  cyan: "34,211,238",
  violet: "167,139,250",
};

const ACCENT_ALPHA: Record<ArenaIntensity, number> = { low: 0.08, medium: 0.14, high: 0.22 };

/**
 * ThumbBat's atmospheric stadium-lighting backdrop (Sprint 6).
 *
 * A layered stack of gradients (deep-indigo base → mint/cyan floodlight
 * cones from above → optional violet ambient glow → optional art → subtle
 * particles → vignette) — deliberately NOT a "cyberpunk dashboard" grid or
 * a canvas/WebGL effect. Particle count is capped and driven by pure CSS
 * transform/opacity so it's cheap regardless of device; `intensity="low"`
 * (or `particles={false}`) degrades further for low-power/mobile callers.
 * `prefers-reduced-motion` disables particle motion automatically.
 *
 * This is presentation-only — no socket/game-state logic — per Sprint 6's
 * "game visual primitives vs. game logic components" separation.
 */
export default function ArenaBackground({
  variant = "gameplay",
  image,
  intensity = "medium",
  accent = "violet",
  vignette = true,
  particles = true,
  fixed = false,
  className,
}: ArenaBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const particleCount = particles && !reduceMotion ? PARTICLE_COUNT[intensity] : 0;

  const seededParticles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => {
        // Deterministic per-index pseudo-randomness — avoids Math.random()
        // in render (which would mismatch between server and client) while
        // still reading as organic drift.
        const seed = (i * 137) % 97;
        return {
          id: i,
          left: 6 + ((seed * 3.7) % 88),
          delay: (seed % 11) * 0.6,
          duration: 9 + (seed % 7),
          dx: (seed % 2 === 0 ? 1 : -1) * (4 + (seed % 10)),
          size: 2 + (seed % 3),
        };
      }),
    [particleCount]
  );

  return (
    <div
      aria-hidden="true"
      data-arena-variant={variant}
      className={cx(
        "pointer-events-none inset-0 -z-10 overflow-hidden bg-tb-bg-deep",
        fixed ? "fixed" : "absolute",
        className
      )}
    >
      {/* Base atmosphere: deep indigo wash rising from the ground */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(30,27,58,0.9),transparent_60%)]" />

      {/* Stadium floodlight cones — mint/cyan from above, restrained */}
      <div className="absolute -top-1/4 left-1/2 h-[70%] w-[140%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(110,231,183,0.16),transparent_60%)]" />
      <div className="absolute -top-1/4 left-1/2 h-[60%] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.10),transparent_55%)]" />

      {/* Optional accent glow — the reference's violet ambient tunnel light */}
      {accent !== "none" && (
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, rgba(${ACCENT_RGB[accent]},${ACCENT_ALPHA[intensity]}), transparent 65%)`,
          }}
        />
      )}

      {/* Optional backdrop art (asset-contract driven, see assetContract.ts) */}
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            fill
            priority={image.priority}
            sizes="100vw"
            className="object-cover"
            style={{ opacity: image.opacity ?? 0.55 }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,12,0.35),rgba(5,6,12,0.85))]" />
        </>
      )}

      {/* Subtle particles — CSS transform/opacity only, capped count, no canvas */}
      {seededParticles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-tb-mint/70"
          style={
            {
              left: `${p.left}%`,
              bottom: "-4px",
              width: p.size,
              height: p.size,
              animation: `tb-particle-drift ${p.duration}s ease-in ${p.delay}s infinite`,
              "--tb-particle-dx": `${p.dx}px`,
              "--tb-particle-dy": `-${180 + p.size * 20}px`,
              "--tb-particle-opacity": 0.45,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Vignette */}
      {vignette && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_45%,rgba(5,6,12,0.65)_100%)]" />
      )}
    </div>
  );
}
