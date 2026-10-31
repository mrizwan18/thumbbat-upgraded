"use client";

import React from "react";
import RoomBanner from "@/components/game/room/RoomBanner";
import TossOverlay from "@/components/game/overlays/TossOverlay";
import InningsOverlay from "@/components/game/overlays/InningsOverlay";
import GameOverModal from "@/components/game/overlays/GameOverModal";
import GameBoard from "@/components/game/board/GameBoard";
import Snackbar from "@/components/ui/Snackbar";
import AppBackground from "@/components/ui/Background";

/**
 * GameShell is presentation/layout only.
 *
 * It owns no socket connection, no game state, no timers, and no event
 * listeners. Callers (route components) keep owning their own state via
 * useGameSocket()/useBotGame() and pass already-computed prop objects in.
 * Each prop group mirrors the existing child component's own prop type
 * exactly (via React.ComponentProps) so this shell can never drift from
 * the contracts those components already had.
 */

type RoomBannerProps = React.ComponentProps<typeof RoomBanner>;
type TossOverlayProps = React.ComponentProps<typeof TossOverlay>;
type GameBoardProps = React.ComponentProps<typeof GameBoard>;
type InningsOverlayProps = React.ComponentProps<typeof InningsOverlay>;
type GameOverModalProps = React.ComponentProps<typeof GameOverModal>;
type SnackbarProps = React.ComponentProps<typeof Snackbar>;

export default function GameShell({
  header,
  containerStyle,
  roomBanner,
  lobby,
  toss,
  board,
  innings,
  gameOver,
  snackbar,
  extraOverlay,
}: {
  /** Route-specific heading block (title + subtitle) rendered above the shared layout. */
  header: React.ReactNode;
  /** Optional inline style for the main content container (routes differ slightly today). */
  containerStyle?: React.CSSProperties;
  /** Pass a props object to show the room banner, or null/undefined to hide it. */
  roomBanner?: RoomBannerProps | null;
  /** Route-specific lobby slot (e.g. quick match / join room / solo cards). Null on routes with no lobby. */
  lobby?: React.ReactNode;
  /** Pass a props object to show the toss overlay, or null/undefined to hide it. */
  toss?: TossOverlayProps | null;
  /** Pass a props object to show the game board, or null/undefined to hide it. */
  board?: GameBoardProps | null;
  innings: InningsOverlayProps;
  gameOver: GameOverModalProps;
  snackbar: SnackbarProps;
  /** Route-specific overlay slot (e.g. the bot "game start" popup on /game). */
  extraOverlay?: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] text-tb-text-primary relative">
      {/* BG (Sprint 1: shared ThumbBat background primitive) */}
      <AppBackground variant="game" />

      {/* pt- was navbar clearance; the navbar is gone (Sprint 5), so this
          is just top breathing room now. */}
      <div
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8 pb-20"
        style={containerStyle}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">{header}</div>

        {/* Room banner (pre-game in code room) */}
        {roomBanner && (
          <div className="mt-6">
            <RoomBanner {...roomBanner} />
          </div>
        )}

        {/* Route-specific lobby (e.g. quick match / join room / solo cards) */}
        {lobby}

        {/* Toss overlay */}
        {toss && <TossOverlay {...toss} />}

        {/* Game board */}
        {board && (
          <div className="mt-6 sm:mt-10">
            <div className="mx-auto w-full max-w-[720px]">
              <GameBoard {...board} />
            </div>
          </div>
        )}
      </div>

      {/* Innings overlay */}
      <InningsOverlay {...innings} />

      {/* Route-specific overlay (e.g. bot game-start popup) */}
      {extraOverlay}

      {/* Game over modal */}
      <GameOverModal {...gameOver} />

      {/* Snackbar */}
      <Snackbar {...snackbar} />
    </div>
  );
}
