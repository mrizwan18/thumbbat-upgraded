"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@/components/ui/Button";
import { useGoogleAuth } from "@/src/hooks/useGoogleAuth";

const HINTS = [
  "Win the toss and choose whether to bat or bowl first.",
  "Pick the same number as your opponent while bowling to take a wicket.",
  "Batting is about outguessing your opponent, not picking big every time.",
  "Chase down the target before you run out of wickets to win.",
  "Every move is 1 to 6 — the same number as your opponent means a wicket.",
  "A private match lets you invite a friend with a room code.",
  "Quick Match pairs you with the next available opponent instantly.",
  "Keep an eye on the run rate once you're chasing in the second innings.",
];

function pickHint() {
  return HINTS[Math.floor(Math.random() * HINTS.length)];
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.5H24v7h11.3C33.7 31.9 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2 1.4-4.6 2.2-7.7 2.2-5.3 0-9.7-3.1-11.4-7.6l-6.6 5.1C9.6 40.6 16.2 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.2-2.2 4.1-4 5.4l6.6 5.6C41.5 35.5 45 30.1 45 24c0-1.4-.1-2.8-.4-4.5z"
      />
    </svg>
  );
}

/**
 * The Sprint 5 boot CTA — replaces the account-prompt block over the
 * cinematic's final frame. Deliberately just one button (real Google OAuth
 * via `useGoogleAuth`, not a placeholder) and a rotating gameplay hint,
 * nothing else, per product direction.
 */
export default function GoogleSignInCTA() {
  const { signIn, loading } = useGoogleAuth();
  const [hint] = useState(pickHint);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Button
        onClick={signIn}
        loading={loading}
        className="w-full !bg-white !text-gray-800 shadow-lg hover:!bg-gray-100"
      >
        {!loading && <GoogleGlyph />}
        Continue with Google
      </Button>

      <motion.p
        key={hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-center text-tb-caption text-tb-text-secondary/80"
      >
        {hint}
      </motion.p>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        theme="dark"
        toastClassName={() =>
          "relative flex p-3 mb-2 rounded-tb-lg bg-tb-surface-elevated border border-tb-border text-tb-text-primary shadow-tb-elevated text-sm"
        }
      />
    </div>
  );
}
