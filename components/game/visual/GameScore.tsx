import React from "react";
import { cx } from "@/components/ui/cx";

export type GameScoreStatus = "normal" | "leading" | "trailing" | "tie";

export interface GameScoreProps {
  youLabel?: string;
  opponentLabel?: string;
  youScore: number | string;
  opponentScore: number | string;
  /** Caller-computed (this component only renders the visual, per Sprint 6 scope). */
  status?: GameScoreStatus;
  /** Optional small identity glyph/avatar per side. */
  youIcon?: React.ReactNode;
  opponentIcon?: React.ReactNode;
  className?: string;
}

const SIDE_TONE: Record<GameScoreStatus, { you: string; opp: string }> = {
  normal: { you: "text-tb-text-primary", opp: "text-tb-text-primary" },
  leading: { you: "text-tb-mint", opp: "text-tb-text-secondary" },
  trailing: { you: "text-tb-text-secondary", opp: "text-tb-mint" },
  tie: { you: "text-tb-text-primary", opp: "text-tb-text-primary" },
};

/**
 * The compact YOU—score—OPP readout (Sprint 6). Not a scoreboard card —
 * no border-heavy panel, no table — meant to sit directly over arena
 * artwork (see `ArenaBackground`) with just enough surface to stay legible.
 */
export default function GameScore({
  youLabel = "YOU",
  opponentLabel = "OPP",
  youScore,
  opponentScore,
  status = "normal",
  youIcon,
  opponentIcon,
  className,
}: GameScoreProps) {
  const tone = SIDE_TONE[status];

  return (
    <div
      className={cx(
        "inline-flex items-center gap-3 rounded-tb-pill border border-tb-border bg-tb-bg-elevated/70 px-4 py-2 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {youIcon}
        <span className="text-tb-label uppercase text-tb-text-muted">{youLabel}</span>
      </div>

      <div className="flex items-center gap-2 text-tb-score tabular-nums leading-none">
        <span className={tone.you}>{youScore}</span>
        <span className="text-sm font-normal text-tb-text-muted">—</span>
        <span className={tone.opp}>{opponentScore}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-tb-label uppercase text-tb-text-muted">{opponentLabel}</span>
        {opponentIcon}
      </div>
    </div>
  );
}
