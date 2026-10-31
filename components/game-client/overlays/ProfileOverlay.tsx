"use client";

import React from "react";
import { getButtonClassName } from "@/components/ui/buttonStyles";

export interface ProfileOverlayProps {
  username: string;
  onSignOut: () => void;
  onClose: () => void;
}

/**
 * Deliberately minimal — no settings feature exists anywhere in this
 * codebase (flagged in the Sprint 7 and Phase 1 writeups too). This is
 * identity + sign-out only, not a stand-in for a real Settings surface;
 * building that out needs its own scope, not an invented one here.
 */
export default function ProfileOverlay({ username, onSignOut, onClose }: ProfileOverlayProps) {
  return (
    <div className="w-full max-w-sm rounded-t-2xl border-t border-tb-border bg-tb-bg-elevated/95 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center backdrop-blur-md sm:rounded-2xl sm:border">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-tb-border bg-tb-surface-elevated text-xl font-bold text-tb-mint">
        {(username.trim()[0] || "?").toUpperCase()}
      </div>
      <p className="mt-3 text-tb-h2 text-tb-text-primary">{username}</p>

      <button
        type="button"
        onClick={onSignOut}
        className={`${getButtonClassName({ variant: "danger" })} mt-6 w-full`}
      >
        Sign Out
      </button>
      <button type="button" onClick={onClose} className="mt-4 text-tb-caption text-tb-text-muted hover:text-tb-text-secondary">
        Close
      </button>
    </div>
  );
}
