import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cx } from "@/components/ui/cx";
import GameScore from "./GameScore";

export type ResultVariant = "win" | "loss" | "walkover";

export interface ResultCardAction {
  label: string;
  onClick: () => void;
}

export interface ResultCardProps {
  variant: ResultVariant;
  /** Overrides the default headline ("VICTORY" / "DEFEAT" / "WALKOVER"). */
  headline?: string;
  youName: string;
  opponentName: string;
  youScore: number | string;
  opponentScore: number | string;
  primaryAction: ResultCardAction;
  secondaryAction?: ResultCardAction;
  className?: string;
}

const DEFAULT_HEADLINE: Record<ResultVariant, string> = {
  win: "VICTORY",
  loss: "DEFEAT",
  walkover: "WALKOVER",
};

const VARIANT_STYLE: Record<ResultVariant, { border: string; glow: string; headline: string }> = {
  win: { border: "border-tb-primary/50", glow: "shadow-tb-glow-mint", headline: "text-tb-primary" },
  loss: { border: "border-tb-secondary/40", glow: "shadow-tb-glow-violet", headline: "text-tb-secondary" },
  walkover: { border: "border-tb-cyan/40", glow: "shadow-tb-glow-cyan", headline: "text-tb-cyan" },
};

/**
 * The cinematic result-card primitive (Sprint 6) — a game result plaque,
 * not a web modal: no header/body/footer chrome, no close button, just
 * headline → score → identities → actions. The Result *route* (arena
 * backdrop, entry animation) is Sprint 11's job; this is only the
 * reusable card consumed there.
 */
export default function ResultCard({
  variant,
  headline,
  youName,
  opponentName,
  youScore,
  opponentScore,
  primaryAction,
  secondaryAction,
  className,
}: ResultCardProps) {
  const style = VARIANT_STYLE[variant];

  return (
    <Card
      variant="elevated"
      className={cx("border-2 px-6 py-8 text-center", style.border, style.glow, className)}
    >
      <p className={cx("text-tb-display tracking-tight", style.headline)}>
        {headline ?? DEFAULT_HEADLINE[variant]}
      </p>

      <div className="mt-5 flex justify-center">
        <GameScore
          youLabel={youName}
          opponentLabel={opponentName}
          youScore={youScore}
          opponentScore={opponentScore}
          status={variant === "win" ? "leading" : variant === "loss" ? "trailing" : "tie"}
        />
      </div>

      <div className="mt-7 flex flex-col gap-3">
        <Button variant="primary" className="w-full" onClick={primaryAction.onClick}>
          {primaryAction.label}
        </Button>
        {secondaryAction && (
          <Button variant="ghost" className="w-full" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </Card>
  );
}
