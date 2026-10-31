"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  WorldLayer,
  AtmosphereLayer,
  HUDLayer,
  InteractionLayer,
  OverlayLayer,
} from "../shell/layerSlots";
import { ArenaBackdrop, ArenaAtmosphere, CricketBallGlyph } from "../world/ArenaWorld";
import PlayButton from "../controls/PlayButton";
import PrivateMatchOverlay from "../overlays/PrivateMatchOverlay";
import LeaderboardOverlay from "../overlays/LeaderboardOverlay";
import ProfileOverlay from "../overlays/ProfileOverlay";
import type { OverlayState } from "../state/types";
import { haptic } from "../services/haptics";

export interface HomeStateProps {
  username: string;
  onPlay: () => void;
  onSoloPractice: () => void;
  onJoinRoom: (code: string) => void | Promise<void>;
  onCreateRoom: () => void | Promise<void>;
  onLeaveRoom?: () => void;
  onSignOut: () => void;
  /** True once a room actually exists (state === "private_lobby") — forces the private-match overlay open and switches it to the waiting-room view. */
  inPrivateLobby: boolean;
  roomCode: string | null;
  roomPlayers: string[];
  isHost: boolean;
  roomReady: boolean;
  onStartRoomGame: () => void;
  /** Set when the derived GameClientState is itself "leaderboard"/"profile_settings" (opened via this screen, still rendered while it's up). */
  activeOverlay: OverlayState;
  onOpenOverlay: (overlay: Exclude<OverlayState, null>) => void;
  onCloseOverlay: () => void;
}

function InitialsAvatar({ name }: { name: string }) {
  const initial = (name.trim()[0] || "?").toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-tb-border bg-tb-surface-elevated text-sm font-bold text-tb-mint">
      {initial}
    </div>
  );
}

/** Small icon control for the HUD — trophy (leaderboard) / gear (profile). Not a nav bar: two isolated circular controls, not a bar of items. */
function HudIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        haptic("light");
        onClick();
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-tb-border bg-tb-surface-elevated/80 text-tb-text-secondary backdrop-blur-sm transition-colors hover:text-tb-mint"
    >
      {children}
    </button>
  );
}

/**
 * THUMBBAT title screen (Phase 2) — the real deliverable, unlike the
 * bare-functional stand-ins for matchmaking/match_intro/gameplay/result
 * (see MinimalStatePlaceholder.tsx). Renders entirely through
 * GameClientShell's layer slots per the architectural rule — no
 * independent fullscreen tree.
 *
 * `inPrivateLobby` lets `GameClient.tsx` route both the `home` and
 * `private_lobby` derived states through this same component: there's no
 * separate Private Lobby *screen* yet (that's future scope), so the
 * private-match overlay simply switches from its code-entry view to its
 * waiting-room view depending on whether a room actually exists.
 */
export default function HomeState({
  username,
  onPlay,
  onSoloPractice,
  onJoinRoom,
  onCreateRoom,
  onSignOut,
  inPrivateLobby,
  roomCode,
  roomPlayers,
  isHost,
  roomReady,
  onStartRoomGame,
  activeOverlay,
  onOpenOverlay,
  onCloseOverlay,
}: HomeStateProps) {
  const [privateMatchOpen, setPrivateMatchOpen] = useState(false);
  const showPrivateMatch = privateMatchOpen || inPrivateLobby;

  return (
    <>
      <WorldLayer>
        <ArenaBackdrop intensity="medium" />
      </WorldLayer>

      <AtmosphereLayer>
        <ArenaAtmosphere intensity="medium" />
      </AtmosphereLayer>

      <HUDLayer>
        <div
          className="flex items-center justify-between px-5"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <InitialsAvatar name={username} />
            <span className="text-sm font-semibold text-tb-text-primary">{username}</span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <HudIconButton label="Leaderboard" onClick={() => onOpenOverlay("leaderboard")}>
              🏆
            </HudIconButton>
            <HudIconButton label="Profile" onClick={() => onOpenOverlay("profile_settings")}>
              ⚙
            </HudIconButton>
          </div>
        </div>
      </HUDLayer>

      <InteractionLayer>
        {/* pointer-events-none on the outer column and its spacers — only
            the hero cluster below re-enables pointer-events-auto. This
            layer is `absolute inset-0`, same as every other layer; an
            invisible full-width flex-grow spacer with inherited
            pointer-events:auto silently blocked every HUDLayer click
            underneath it (z-30 over z-20) until this was scoped down. */}
        <div
          className="pointer-events-none flex h-full w-full flex-col px-6"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex-[3]" />

          <div className="pointer-events-auto flex flex-col items-center gap-7 pb-10 text-center">
            <div className="relative flex items-center gap-2">
              <div className="relative h-16 w-48 drop-shadow-[0_0_28px_rgba(110,231,183,0.35)]">
                <Image src="/thumbbat-logo.png" alt="ThumbBat" fill priority sizes="192px" className="object-contain" />
              </div>
              <CricketBallGlyph className="absolute -right-7 top-1 h-6 w-6 drop-shadow-[0_0_8px_rgba(140,58,58,0.6)]" />
            </div>

            <PlayButton onPlay={onPlay} />

            <div className="flex items-center gap-5 text-tb-caption">
              <button
                type="button"
                onClick={() => setPrivateMatchOpen(true)}
                className="font-semibold text-tb-text-secondary transition-colors hover:text-tb-text-primary"
              >
                Private Match
              </button>
              <span className="text-tb-text-muted">•</span>
              <button
                type="button"
                onClick={() => {
                  haptic("light");
                  onSoloPractice();
                }}
                className="font-semibold text-tb-text-secondary transition-colors hover:text-tb-text-primary"
              >
                Practice
              </button>
            </div>
          </div>

          <div className="flex-1" />
        </div>
      </InteractionLayer>

      <OverlayLayer>
        <AnimatePresence>
          {showPrivateMatch && (
            <motion.div
              key="private-match"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full items-end justify-center bg-black/60 sm:items-center"
            >
              <PrivateMatchOverlay
                inRoom={inPrivateLobby}
                roomCode={roomCode}
                roomPlayers={roomPlayers}
                isHost={isHost}
                roomReady={roomReady}
                onJoin={onJoinRoom}
                onCreate={onCreateRoom}
                onStartGame={onStartRoomGame}
                onClose={inPrivateLobby ? undefined : () => setPrivateMatchOpen(false)}
              />
            </motion.div>
          )}

          {activeOverlay === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full items-end justify-center bg-black/60 sm:items-center"
            >
              <LeaderboardOverlay onClose={onCloseOverlay} />
            </motion.div>
          )}

          {activeOverlay === "profile_settings" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full items-end justify-center bg-black/60 sm:items-center"
            >
              <ProfileOverlay username={username} onSignOut={onSignOut} onClose={onCloseOverlay} />
            </motion.div>
          )}
        </AnimatePresence>
      </OverlayLayer>
    </>
  );
}
