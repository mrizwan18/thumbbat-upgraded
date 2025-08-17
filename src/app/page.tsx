"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [myName, setMyName] = useState("Player");
  const [isLoggedIn, setIsloggedIn] = useState(false);

  // Safe localStorage read + optional redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const n = localStorage.getItem("username");
    if (n) setMyName(n);
    if (localStorage.getItem("token")) {
      setIsloggedIn(true)
    }
  }, [router]);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  const stagger = {
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden mt-10">
      {/* Decorative background */}
      <BackgroundDecor />

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2 gap-10 px-6 pt-8 md:pt-16">
          {/* Left: copy & CTAs */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="flex flex-col justify-center"
          >
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
            >
              The quick, playful{" "}
              <span className="block bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-200 bg-clip-text text-transparent">
                thumb cricket
              </span>{" "}
              you loved as a kid.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 max-w-prose text-base sm:text-lg text-white/70">
              Toss, pick 1–6, and outsmart your opponent in real-time. Zero clutter, buttery animations,
              and instant matches. Ready when you are, {myName}.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
              >
                Play now
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-white/90 hover:bg-white/5 transition-colors"
              >
                How it works
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6 flex items-center gap-4 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live matchmaking
              </span>
              <span>Secure accounts</span>
              <span>No ads</span>
            </motion.div>
          </motion.div>

          {/* Right: primary focus — Join by code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,.3)]"
          >
            <JoinRoomByCode variant="hero" />
          </motion.div>
        </div>
      </section>


      {/* Recent Matches */}
      <section className="relative z-10 mt-16 md:mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            Recent matches
          </motion.h2>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-3 overflow-hidden">
            <RecentMatchesMarquee />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 mt-16 md:mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            Players are vibing 🎉
          </motion.h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TestimonialCard
              quote="Fast, simple, and way more fun than I expected. That wicket animation hits!"
              author="Ayesha"
              handle="@ayesha.dev"
            />
            <TestimonialCard
              quote="The 5s timer keeps rounds snappy. Zero lag even on mobile data."
              author="Zain"
              handle="@zainplays"
            />
            <TestimonialCard
              quote="Reminds me of school canteen matches. Nostalgia with polish."
              author="Hira"
              handle="@hiraggs"
            />
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative z-10 mt-16 md:mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-lime-400/10 to-amber-300/10 p-6 md:p-10 text-center backdrop-blur-md"
          >
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Ready to bat first?</h3>
            <p className="mt-2 text-white/70">Jump into a match in seconds. No ads. No clutter. Just vibes.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
              >
                Find a match
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-white/90 hover:bg-white/5 transition-colors"
              >
                Create account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-16 md:mt-24 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} ThumbBat. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/90">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/90">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white/90">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================ UI bits ============================ */

function BackgroundDecor() {
  const noiseDataUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 40 40'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E";

  return (
    <>
      {/* radial glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.25),_transparent)]" />
      {/* grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("${noiseDataUrl}")` }}
      />
    </>
  );
}

function RecentMatchesMarquee() {
  const items = [
    { a: "MR", b: "MI", as: 36, bs: 35, w: "MR" },
    { a: "HN", b: "MS", as: 22, bs: 17, w: "HN" },
    { a: "RS", b: "AK", as: 41, bs: 39, w: "RS" },
    { a: "HH", b: "ZS", as: 13, bs: 21, w: "ZS" },
    { a: "UM", b: "FA", as: 29, bs: 30, w: "FA" },
  ];
  const track = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex gap-3"
        animate={{ x: [0, -600] }}
        transition={{ repeat: Infinity, repeatType: "loop", ease: "linear", duration: 20 }}
      >
        {track.map((m, i) => (
          <MatchChip key={i} a={m.a} b={m.b} as={m.as} bs={m.bs} w={m.w} />
        ))}
      </motion.div>
    </div>
  );
}

function MatchChip({
  a,
  b,
  as,
  bs,
  w,
}: {
  a: string;
  b: string;
  as: number;
  bs: number;
  w: string;
}) {
  const winA = w === a;
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-gray-900/60 px-3 py-2">
      <Badge label={a} active={winA} />
      <span className="text-white/60 text-xs">{as}</span>
      <span className="text-white/30">•</span>
      <Badge label={b} active={!winA} />
      <span className="text-white/60 text-xs">{bs}</span>
      <span className="ml-2 text-emerald-300 text-xs">{w} won</span>
    </div>
  );
}

function Badge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`inline-grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
        active ? "bg-emerald-400 text-gray-900" : "bg-white/10 text-white/80"
      }`}
    >
      {label}
    </span>
  );
}

function TestimonialCard({ quote, author, handle }: { quote: string; author: string; handle: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-white/10">⭐️</span>
        <div>
          <p className="text-sm text-white/80">“{quote}”</p>
          <p className="mt-2 text-xs text-white/50">
            — {author} <span className="text-white/30">{handle}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ================== Join by Code (hero primary) ================== */

type JoinVariant = "hero" | "card";

function JoinRoomByCode({ variant = "card" }: { variant?: JoinVariant }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoggedIn, setIsloggedIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("token")) {
      setIsloggedIn(true)
    }
  }, [router]);

  const isHero = variant === "hero";

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const c = normalized;
    if (c.length < 4 || c.length > 8) {
      setErr("Enter a 4–8 character code");
      return;
    }
    // NEW: auth gate
    if (!isLoggedIn) {
      // preserve intent
      return router.push(`/login?next=${encodeURIComponent(`/game?join=${c}`)}`);
    }
    setLoading(true);
    try {
      router.push(`/game?join=${c}`);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleCreate() {
    const c = genCode();
    if (!isLoggedIn) {
      return router.push(`/login?next=${encodeURIComponent(`/game?host=${c}`)}`);
    }
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(c);
      setToast(`Room code copied: ${c}`);
    } catch {
      setToast(`Room code: ${c}`);
    } finally {
      setTimeout(() => setToast(null), 2200);
    }
    router.push(`/game?host=${c}`);
  }

  useEffect(() => {
    if (isHero && inputRef.current) inputRef.current.focus();
  }, [isHero]);

  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

  function genCode(len = 6) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip 0,O,1,I
    let out = "";
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: isHero ? 8 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={
        isHero
          ? "rounded-3xl bg-gradient-to-br from-emerald-500/10 via-lime-400/10 to-amber-300/10 p-6 md:p-8"
          : "rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      }
    >
      <h2 className={isHero ? "text-2xl md:text-3xl font-bold tracking-tight" : "text-xl md:text-2xl font-bold tracking-tight"}>
        Join a room by code
      </h2>
      <p className={isHero ? "mt-2 text-base text-white/80" : "mt-1 text-sm text-white/70"}>
        Ask a friend for their code, or create your own private room.
      </p>

      <form
        onSubmit={handleJoin}
        className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center"
      >
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="text"
          aria-label="Room code"
          placeholder="e.g. 7F2B"
          className={
            isHero
              ? "w-full rounded-2xl border border-white/10 bg-gray-900/50 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-emerald-400/60"
              : "w-full rounded-2xl border border-white/10 bg-gray-900/50 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/60"
          }
        />
        <button
          type="submit"
          disabled={loading}
          className={
            isHero
              ? "inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-6 py-3 text-lg text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95 disabled:opacity-60"
              : "inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95 disabled:opacity-60"
          }
        >
          {loading ? "Joining…" : "Join room"}
        </button>
        <button
          type="button"
          onClick={handleCreate}
          className={
            isHero
              ? "inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-lg text-white/90 hover:bg-white/5 transition-colors"
              : "inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-white/90 hover:bg-white/5 transition-colors"
          }
        >
          Create private room
        </button>
      </form>

      {/* Tiny toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 inline-block rounded-xl bg-gray-900/90 px-3 py-2 text-xs text-white/90 border border-white/10"
          role="status"
          aria-live="polite"
        >
          {toast}
        </motion.div>
      )}

      {/* Error */}
      {err && <p className="mt-2 text-sm text-amber-300">{err}</p>}
    </motion.div>
  );
}