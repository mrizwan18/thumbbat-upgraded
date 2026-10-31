"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

import GameViewport from "@/components/ui/GameViewport";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { getButtonClassName } from "@/components/ui/buttonStyles";
import { slideUp } from "@/components/ui/motion";
import { cx } from "@/components/ui/cx";
import { useAuthForm, type AuthMode } from "@/src/hooks/useAuthForm";

export interface AuthOverlayProps {
  /**
   * "screen" (default): full-viewport `GameViewport` background + logo —
   * used by `/login` (standalone fallback route).
   * "bare": just the prompt/form content, no background or logo — used by
   * `CinematicLoader` (Sprint 5), which overlays this directly on top of
   * the cinematic's final frame instead of a solid backdrop.
   */
  variant?: "screen" | "bare";
  className?: string;
}

/**
 * The game-account startup prompt (Sprint 5).
 *
 * Collapsed by default — a "ready to play?" prompt, not a form. Tapping
 * either action expands the existing username/password/email fields
 * in place. Every field, validator, API call, storage write, toast, and
 * redirect below comes from `useAuthForm` — this component only owns the
 * collapsed/expanded presentation state, nothing behavioral.
 */
export default function AuthOverlay({ variant = "screen", className }: AuthOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    mode,
    setMode,
    isLogin,
    username,
    setUsername,
    email,
    setEmail,
    pw,
    setPw,
    showPw,
    setShowPw,
    loading,
    uErr,
    eErr,
    pErr,
    handleSubmit,
  } = useAuthForm();

  const openAs = (m: AuthMode) => {
    setMode(m);
    setExpanded(true);
  };

  const content = (
    <>
      {variant === "screen" && (
        <div className="relative h-14 w-36">
          <Image
            src="/thumbbat-logo.png"
            alt="ThumbBat"
            fill
            sizes="144px"
            priority
            className="object-contain"
          />
        </div>
      )}

      {/* mode="sync" (the default) rather than "wait" — the new panel must
          mount immediately regardless of whether the old one's exit
          transition ever completes (it does for real users; this also
          just avoids depending on animation-completion for correctness). */}
      <AnimatePresence initial={false}>
        {!expanded ? (
          <motion.div
            key="prompt"
            initial={slideUp.initial}
            animate={slideUp.animate}
            exit={slideUp.exit}
            className="flex w-full flex-col items-center gap-5 text-center"
          >
            <p className="text-tb-h2 tracking-tight text-tb-text-primary">Ready to play?</p>

            <div className="flex w-full flex-col gap-3">
              <Button className="w-full" onClick={() => openAs("login")}>
                Log in to play
              </Button>
              <button
                type="button"
                onClick={() => openAs("signup")}
                className={cx(getButtonClassName({ variant: "ghost" }), "w-full")}
              >
                Create account
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={slideUp.initial}
            animate={slideUp.animate}
            exit={slideUp.exit}
            className="w-full"
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-tb-caption text-tb-text-secondary hover:text-tb-text-primary"
              >
                &larr; Back
              </button>
              <div className="flex items-center gap-1.5 text-tb-caption">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={isLogin ? "font-semibold text-tb-text-primary" : "text-tb-text-secondary"}
                  aria-pressed={isLogin}
                >
                  Login
                </button>
                <span className="text-tb-text-muted">/</span>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={!isLogin ? "font-semibold text-tb-text-primary" : "text-tb-text-secondary"}
                  aria-pressed={!isLogin}
                >
                  Signup
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                label="Username"
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                placeholder="e.g. rizzwon"
                error={uErr}
              />

              <AnimatePresence initial={false} mode="sync">
                {!isLogin && (
                  <motion.div
                    key="email"
                    initial={slideUp.initial}
                    animate={slideUp.animate}
                    exit={slideUp.exit}
                  >
                    <FormField
                      label="Email"
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      placeholder="you@example.com"
                      error={eErr}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <FormField
                label="Password"
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={loading}
                placeholder="********"
                error={pErr}
                hint={!pErr ? "Use 8+ chars, 1 uppercase, 1 number, 1 symbol." : undefined}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    disabled={loading}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    aria-pressed={showPw}
                    className="rounded-tb-sm p-1 text-tb-text-secondary hover:text-tb-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tb-primary/60 disabled:opacity-50"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <Button type="submit" loading={loading} className="w-full">
                {isLogin ? "Log in" : "Create account"}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        theme="dark"
        toastClassName={() =>
          "relative flex p-3 mb-2 rounded-tb-lg bg-tb-surface-elevated border border-tb-border text-tb-text-primary shadow-tb-elevated text-sm"
        }
      />
    </>
  );

  if (variant === "bare") {
    return <div className={cx("flex w-full flex-col items-center gap-5", className)}>{content}</div>;
  }

  return (
    <GameViewport className={cx("items-center justify-center gap-8 px-6 py-10", className)}>
      {content}
    </GameViewport>
  );
}
