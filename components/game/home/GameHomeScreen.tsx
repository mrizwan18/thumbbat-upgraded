"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ArenaBackground from "@/components/game/visual/ArenaBackground";
import JoinRoomCard from "@/components/game/lobby/JoinRoomCard";
import Button from "@/components/ui/Button";
import { getButtonClassName } from "@/components/ui/buttonStyles";
import { slideUp } from "@/components/ui/motion";
import { cx } from "@/components/ui/cx";

export interface GameHomeScreenProps {
  username: string;
  searching: boolean;
  searchTime: number;
  searchError: string | null;
  onPlay: () => void;
  onCancelSearch: () => void;
  onSoloPractice: () => void;
  onJoinRoom: (code: string) => void | Promise<void>;
  onCreateRoom: () => void | Promise<void>;
}

function InitialsAvatar({ name }: { name: string }) {
  const initial = (name.trim()[0] || "?").toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-tb-border bg-tb-surface-elevated text-sm font-bold text-tb-mint">
      {initial}
    </div>
  );
}

/**
 * The THUMBBAT game title screen (Sprint 7) — replaces the old three-card
 * IDLE lobby. Purely presentational: every callback here is an existing
 * handler from `useGameSocket()`/`useBotGame()`, passed down unchanged by
 * `GameScreen.tsx`. No socket logic, no new game state, lives here.
 *
 * PLAY maps to the existing Quick Match flow (the closest thing this game
 * has to a single "just play" action). Private Match and Practice vs Bot
 * remain fully functional but are deliberately small secondary controls,
 * not equal-weight cards — see THUMBBAT_UI_AUDIT.md Sprint 7 for the
 * reasoning. Once matchmaking starts, this same screen shows a minimal
 * searching state (reusing the exact search/cancel/timeout logic
 * `QuickMatchCard` used) rather than nothing — the full-screen "SEARCHING
 * FOR OPPONENT" arena treatment is Sprint 8's job.
 */
export default function GameHomeScreen({
  username,
  searching,
  searchTime,
  searchError,
  onPlay,
  onCancelSearch,
  onSoloPractice,
  onJoinRoom,
  onCreateRoom,
}: GameHomeScreenProps) {
  const [showPrivateMatch, setShowPrivateMatch] = useState(false);
  const reduceMotion = useReducedMotion();
  const timedOut = searching && searchTime >= 60;

  const handleSearchAgain = () => {
    onCancelSearch();
    setTimeout(onPlay, 0);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <ArenaBackground variant="home" accent="violet" intensity="medium" fixed />

      <div
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-6"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        {/* Identity — ambient, not a nav item (Section 6: no profile management here) */}
        <div className="flex items-center gap-2.5">
          <InitialsAvatar name={username} />
          <span className="text-tb-body font-semibold text-tb-text-primary">{username}</span>
        </div>

        <div className="flex-[3]" />

        {/* Hero cluster: wordmark + PLAY + secondary modes */}
        <div className="flex flex-col items-center gap-7 pb-10 text-center">
          <div className="relative h-16 w-48 drop-shadow-[0_0_28px_rgba(110,231,183,0.35)]">
            <Image src="/thumbbat-logo.png" alt="ThumbBat" fill priority sizes="192px" className="object-contain" />
          </div>

          <AnimatePresence mode="wait">
            {!searching && !timedOut && (
              <motion.div
                key="play"
                initial={slideUp.initial}
                animate={slideUp.animate}
                exit={slideUp.exit}
                className="flex flex-col items-center gap-5"
              >
                <motion.div
                  animate={reduceMotion ? undefined : { scale: [1, 1.015, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Button
                    variant="primary"
                    onClick={onPlay}
                    className="px-16 py-5 text-xl tracking-wide"
                  >
                    PLAY
                  </Button>
                </motion.div>

                <div className="flex items-center gap-5 text-tb-caption">
                  <button
                    type="button"
                    onClick={() => setShowPrivateMatch((v) => !v)}
                    aria-expanded={showPrivateMatch}
                    className="font-semibold text-tb-text-secondary transition-colors hover:text-tb-text-primary"
                  >
                    Private Match
                  </button>
                  <span className="text-tb-text-muted">•</span>
                  <button
                    type="button"
                    onClick={onSoloPractice}
                    className="font-semibold text-tb-text-secondary transition-colors hover:text-tb-text-primary"
                  >
                    Practice vs Bot
                  </button>
                </div>
              </motion.div>
            )}

            {searching && !timedOut && (
              <motion.div
                key="searching"
                initial={slideUp.initial}
                animate={slideUp.animate}
                exit={slideUp.exit}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-tb-h2 text-tb-text-primary">
                  Searching for opponent
                  <span className="text-tb-mint tabular-nums"> {Math.min(searchTime, 60)}s</span>
                </p>
                <button
                  type="button"
                  onClick={onCancelSearch}
                  className={getButtonClassName({ variant: "ghost" })}
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {timedOut && (
              <motion.div
                key="timedout"
                initial={slideUp.initial}
                animate={slideUp.animate}
                exit={slideUp.exit}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-tb-body text-tb-text-secondary">No player found in 60s.</p>
                <Button variant="primary" onClick={handleSearchAgain} className="px-10">
                  Search Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {searchError && !searching && (
            <p className="text-tb-caption text-tb-danger">{searchError}</p>
          )}

          <AnimatePresence>
            {showPrivateMatch && (
              <motion.div
                initial={slideUp.initial}
                animate={slideUp.animate}
                exit={slideUp.exit}
                className="w-full max-w-sm"
              >
                <JoinRoomCard myName={username} onJoin={onJoinRoom} onCreate={onCreateRoom} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        {/* Secondary utility — subordinate, per Section 5 */}
        <div className="flex justify-center pb-2">
          <Link
            href="/leaderboard"
            className={cx(
              "inline-flex items-center gap-1.5 text-tb-caption font-semibold text-tb-text-muted transition-colors hover:text-tb-text-primary"
            )}
          >
            🏆 Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
