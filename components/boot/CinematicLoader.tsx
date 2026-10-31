"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GoogleSignInCTA from "@/components/boot/GoogleSignInCTA";
import { cx } from "@/components/ui/cx";

const VIDEO_SRC = "/media/loader.mp4";
const POSTER_SRC = "/media/loader-poster.jpg";
const REDIRECT_FADE_MS = 250;

/**
 * The ThumbBat cinematic boot screen (Sprint 5 direction reset).
 *
 * Full-viewport video (poster shown instantly so there is never a blank
 * frame while the video buffers) that plays once, muted, inline. What
 * happens when it ends/errors depends on `isAuthenticated`:
 *
 *   ended && authenticated    -> short fade, then router.replace("/game")
 *   ended && !authenticated   -> reveal <AuthOverlay variant="bare" />
 *                                over the frozen final frame
 *
 * Autoplay-block and load-error are both treated the same as a natural
 * `ended` event — the cinematic is a boot *enhancement*, never something
 * that can strand the player on a blank/frozen screen.
 */
export default function CinematicLoader({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Warm the next screen's route bundle while the cinematic plays, so the
  // post-cinematic transition (authenticated case) has as little to do as
  // possible.
  useEffect(() => {
    router.prefetch("/game");
  }, [router]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const playAttempt = v.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      // Autoplay blocked by the browser — don't strand the player on a
      // static poster forever; resolve exactly as if the video had ended.
      playAttempt.catch(() => setEnded(true));
    }
  }, []);

  useEffect(() => {
    if (!ended || !isAuthenticated) return;
    setFadingOut(true);
    const t = setTimeout(() => router.replace("/game"), REDIRECT_FADE_MS);
    return () => clearTimeout(t);
  }, [ended, isAuthenticated, router]);

  const handleEnded = () => setEnded(true);
  const handleError = () => {
    setVideoFailed(true);
    setEnded(true);
  };

  const showAuth = ended && !isAuthenticated;

  return (
    <div
      className={cx(
        "fixed inset-0 h-[100dvh] w-full overflow-hidden bg-black transition-opacity duration-300",
        fadingOut && "opacity-0"
      )}
    >
      {videoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={POSTER_SRC} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          playsInline
          autoPlay
          preload="auto"
          onEnded={handleEnded}
          onError={handleError}
        />
      )}

      {showAuth && (
        <>
          {/* Legibility gradient — the CTA needs to stay readable regardless
              of how bright the cinematic's final frame happens to be. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          />
          <div
            className="absolute inset-x-0 bottom-[10%] flex justify-center px-6"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-sm"
            >
              <GoogleSignInCTA />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
