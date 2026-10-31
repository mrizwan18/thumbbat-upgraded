"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cx } from "@/components/ui/cx";
import { ASSET_MANIFEST } from "./assetManifest";

export type ArenaIntensity = "low" | "medium" | "high";

export interface ArenaBackdropProps {
  intensity?: ArenaIntensity;
  className?: string;
}

/**
 * WorldLayer content for Home — the stadium/arena itself. Deep-indigo base
 * → mint/cyan floodlight cones → optional `arenaHome` image (once
 * supplied) → violet ambient glow low. Renders correctly with or without
 * the real asset; nothing here needs to change layout when it arrives.
 *
 * Fresh implementation for the game-client tree — not a reuse of Sprint
 * 6's discarded `ArenaBackground`, even though the atmospheric-lighting
 * *technique* (layered gradients, no canvas) is the same well-understood
 * approach.
 */
export function ArenaBackdrop({ intensity = "medium", className }: ArenaBackdropProps) {
  const asset = ASSET_MANIFEST.arenaHome;
  const glowAlpha = intensity === "high" ? 0.2 : intensity === "low" ? 0.08 : 0.14;

  return (
    <div className={cx("absolute inset-0 h-full w-full overflow-hidden bg-tb-bg-deep", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(30,27,58,0.92),transparent_60%)]" />
      <div className="absolute -top-1/4 left-1/2 h-[70%] w-[140%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(110,231,183,0.16),transparent_60%)]" />
      <div className="absolute -top-1/4 left-1/2 h-[60%] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.1),transparent_55%)]" />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, rgba(167,139,250,${glowAlpha}), transparent 65%)`,
        }}
      />

      {asset.src && (
        <>
          <Image
            src={asset.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,12,0.25),rgba(5,6,12,0.75))]" />
        </>
      )}

      {/* characterPlayer/characterOpponent: non-flow decorative elements —
          nothing to reserve layout-wise, so they simply don't render
          until a real asset exists (see assetManifest.ts). */}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_45%,rgba(5,6,12,0.6)_100%)]" />
    </div>
  );
}

export interface ArenaAtmosphereProps {
  intensity?: ArenaIntensity;
  className?: string;
}

const PARTICLE_COUNT: Record<ArenaIntensity, number> = { low: 0, medium: 7, high: 12 };

/**
 * AtmosphereLayer content — fog/particle drift/light bloom, layered above
 * the backdrop. Pure CSS transform/opacity (the existing
 * `tb-particle-drift` keyframe from Sprint 6's token work in
 * globals.css — a generic animation utility, not tied to any discarded
 * component). `useReducedMotion` disables drift entirely.
 */
export function ArenaAtmosphere({ intensity = "medium", className }: ArenaAtmosphereProps) {
  const reduceMotion = useReducedMotion();
  const count = reduceMotion ? 0 : PARTICLE_COUNT[intensity];

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const seed = (i * 137) % 97;
        return {
          id: i,
          left: 6 + ((seed * 3.7) % 88),
          delay: (seed % 11) * 0.6,
          duration: 10 + (seed % 7),
          dx: (seed % 2 === 0 ? 1 : -1) * (4 + (seed % 10)),
          size: 2 + (seed % 3),
        };
      }),
    [count]
  );

  return (
    <div className={cx("absolute inset-0 h-full w-full overflow-hidden", className)}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-tb-mint/60"
          style={
            {
              left: `${p.left}%`,
              bottom: "-4px",
              width: p.size,
              height: p.size,
              animation: `tb-particle-drift ${p.duration}s ease-in ${p.delay}s infinite`,
              "--tb-particle-dx": `${p.dx}px`,
              "--tb-particle-dy": `-${200 + p.size * 20}px`,
              "--tb-particle-opacity": 0.4,
            } as React.CSSProperties
          }
        />
      ))}

      {!reduceMotion && (
        <div className="absolute inset-x-0 -top-1/3 h-1/2 animate-[tb-bloom-sweep_14s_ease-in-out_infinite] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),transparent_70%)]" />
      )}
    </div>
  );
}

/** A small hand-drawn cricket-ball glyph — stands in for the `cricketBall` asset slot until a real render exists. Not a placeholder box; an actual finished decorative element. */
export function CricketBallGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="13" className="fill-tb-ball-red" />
      <path
        d="M6 10c4 3 4 9 0 12M26 10c-4 3-4 9 0 12"
        stroke="#f5f7fa"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}
