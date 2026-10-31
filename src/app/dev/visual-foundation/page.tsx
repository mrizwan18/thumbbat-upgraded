"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import ArenaBackground from "@/components/game/visual/ArenaBackground";
import GestureIcon, { type GestureState, type GestureValue } from "@/components/game/visual/GestureIcon";
import GameScore from "@/components/game/visual/GameScore";
import ResultCard from "@/components/game/visual/ResultCard";
import GameplayFeedback, { type FeedbackTone } from "@/components/game/visual/GameplayFeedback";

const FEEDBACK_CYCLE: Array<{ text: string; tone: FeedbackTone }> = [
  { text: "FOUR!", tone: "positive" },
  { text: "OUT!", tone: "negative" },
  { text: "CRITICAL!", tone: "critical" },
  { text: "PERFECT!", tone: "neutral" },
];

/**
 * Sprint 6 — internal visual-foundation preview. Dev validation only, not
 * linked from any nav and not covered by `src/middleware.ts` (matcher is
 * `/game/:path*`), so it's reachable but unlisted. Should be removed or
 * gated before a production launch — flagged in THUMBBAT_UI_AUDIT.md.
 */
export default function VisualFoundationPreview() {
  const [selectedGesture, setSelectedGesture] = useState<GestureValue>(3);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const [feedbackIndex, setFeedbackIndex] = useState(0);

  const triggerFeedback = () => {
    const next = FEEDBACK_CYCLE[feedbackIndex % FEEDBACK_CYCLE.length];
    setFeedback(next);
    setFeedbackIndex((i) => i + 1);
  };

  return (
    <div className="relative min-h-[100dvh] w-full">
      <ArenaBackground variant="gameplay" intensity="medium" accent="violet" fixed />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-12 px-6 py-12 text-tb-text-primary">
        <header>
          <p className="text-tb-label text-tb-text-muted">SPRINT 6</p>
          <h1 className="text-tb-display">Visual Foundation Preview</h1>
          <p className="mt-2 text-tb-body text-tb-text-secondary">
            Dev-only. Does this look like the beginning of a premium mobile game?
          </p>
        </header>

        {/* Buttons */}
        <section className="flex flex-col gap-4">
          <p className="text-tb-h2">Game buttons</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">PLAY</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>
              PLAY
            </Button>
            <Button variant="primary" disabled>
              PLAY
            </Button>
          </div>
        </section>

        {/* Gesture icons */}
        <section className="flex flex-col gap-4">
          <p className="text-tb-h2">Gesture icons (1–6)</p>
          <div className="flex flex-wrap items-center gap-4">
            {([1, 2, 3, 4, 5, 6] as GestureValue[]).map((value) => {
              const state: GestureState = value === selectedGesture ? "selected" : "default";
              return (
                <button key={value} onClick={() => setSelectedGesture(value)} aria-label={`Gesture ${value}`}>
                  <GestureIcon value={value} state={state} size={64} />
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <GestureIcon value={selectedGesture} state="revealed" size={64} />
            <span className="text-tb-caption text-tb-text-muted">revealed state (click a gesture above, then reload to replay)</span>
            <GestureIcon value={4} state="disabled" size={64} />
            <span className="text-tb-caption text-tb-text-muted">disabled state</span>
          </div>
        </section>

        {/* Score */}
        <section className="flex flex-col gap-4">
          <p className="text-tb-h2">Game score</p>
          <div className="flex flex-wrap items-center gap-4">
            <GameScore youScore={30} opponentScore={24} status="leading" />
            <GameScore youScore={18} opponentScore={31} status="trailing" />
            <GameScore youScore={20} opponentScore={20} status="tie" />
          </div>
        </section>

        {/* Gameplay feedback */}
        <section className="flex flex-col gap-4">
          <p className="text-tb-h2">Gameplay feedback</p>
          <Button variant="secondary" onClick={triggerFeedback} className="w-fit">
            Trigger feedback
          </Button>
          <div className="relative flex h-24 items-center justify-center">
            <AnimatePresence>
              {feedback && (
                <GameplayFeedback
                  key={feedbackIndex}
                  text={feedback.text}
                  tone={feedback.tone}
                  onComplete={() => setFeedback(null)}
                />
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Result cards */}
        <section className="flex flex-col gap-4 pb-16">
          <p className="text-tb-h2">Result card</p>
          <div className="grid gap-6 sm:grid-cols-3">
            <ResultCard
              variant="win"
              youName="YOU"
              opponentName="RIVAL"
              youScore={42}
              opponentScore={31}
              primaryAction={{ label: "Play Again", onClick: () => {} }}
              secondaryAction={{ label: "Home", onClick: () => {} }}
            />
            <ResultCard
              variant="loss"
              youName="YOU"
              opponentName="RIVAL"
              youScore={22}
              opponentScore={35}
              primaryAction={{ label: "Play Again", onClick: () => {} }}
              secondaryAction={{ label: "Home", onClick: () => {} }}
            />
            <ResultCard
              variant="walkover"
              youName="YOU"
              opponentName="RIVAL"
              youScore={0}
              opponentScore={0}
              primaryAction={{ label: "Play Again", onClick: () => {} }}
              secondaryAction={{ label: "Home", onClick: () => {} }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
