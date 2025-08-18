"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
// Retro arcade font (optional). Remove if you don't want it.
import { Press_Start_2P } from "next/font/google";
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [myName, setMyName] = useState("Player");

  // Redirect logged-in users to /game; otherwise render public home
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const n = localStorage.getItem("username");
    if (n) setMyName(n);

    if (token) {
      router.replace("/game");
      return;
    }
    setCheckedAuth(true);
  }, [router]);

  if (!checkedAuth) return null;

  return (
    <div className="relative min-h-[100svh] bg-gray-950 text-white overflow-hidden">
      <BackgroundFX />

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-20 md:pt-28">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-3xl sm:text-5xl md:text-6xl leading-tight ${pressStart.className}`}
              >
                THUMBBAT
                <span className="block text-base sm:text-xl md:text-2xl mt-3 font-normal normal-case tracking-wider text-white/80">
                  Fast-paced thumb cricket. Neon vibes. Pure fun.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 max-w-prose text-white/75"
              >
                Toss, pick 1–6 in 5 seconds, and outsmart your opponent.
                Buttery animations, instant matches, zero clutter.
                Ready when you are, {myName}.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/login"
                  className="group relative inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-gray-900
                             bg-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,.35)]
                             hover:brightness-95 transition-[filter,transform] active:scale-95"
                >
                  <span className="absolute inset-0 rounded-2xl bg-emerald-300/0 group-hover:bg-emerald-300/10 transition-colors" />
                  <span className="relative">Start Match</span>
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-white/90 hover:bg-white/5 transition-colors"
                >
                  How to play
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-6 flex items-center gap-4 text-xs text-white/50"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live matchmaking
                </span>
                <span>Secure accounts</span>
                <span>No ads</span>
              </motion.div>
            </div>

            {/* Neon “cabinet” block */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-lime-400/10 to-amber-300/10 p-6 md:p-8 backdrop-blur-xl
                         shadow-[0_10px_40px_rgba(0,0,0,.35)]"
            >
              <ArcadeCabinet />
            </motion.div>
          </div>
        </div>
      </section>

      {/* MODES */}
      <section className="relative z-10 mt-16 md:mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Game Modes</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ModeCard
              title="Quick Match"
              desc="Instantly find an opponent and jump straight in."
              cta="Play now"
              href="/login"
              badge="Live"
            />
            <ModeCard
              title="Vs Bot"
              desc="Sharpen your reflexes and practice the chase."
              cta="Warm up"
              href="/login"
              icon="🤖"
            />
            <ModeCard
              title="Challenge a Friend"
              desc="Create a private room and send the code."
              cta="Challenge"
              href="/login"
              icon="🎫"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 mt-16 md:mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How it works</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StepCard num="1" title="Toss" text="Call heads or tails. Winner chooses to bat or bowl." />
            <StepCard num="2" title="Pick 1–6" text="You’ve got 5 seconds each ball. Same number = wicket." />
            <StepCard num="3" title="Chase & Win" text="Hit the target in the second innings or bowl them out!" />
          </div>
        </div>
      </section>

      {/* LIVE TICKER */}
      <section className="relative z-10 mt-16 md:mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Live ticker</h2>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-3 overflow-hidden">
            <Ticker />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mt-16 md:mt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-lime-400/10 to-amber-300/10 p-6 md:p-10 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Press Start to play</h3>
            <p className="mt-2 text-white/70">
              Matches take minutes. Memories last longer.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-6 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
              >
                Start Match
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-white/90 hover:bg-white/5 transition-colors"
              >
                See leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} ThumbBat. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/90">Privacy</Link>
            <Link href="/terms" className="hover:text-white/90">Terms</Link>
            <Link href="/contact" className="hover:text-white/90">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ======================= FX & Components ======================= */

function BackgroundFX() {
  // Neon grid + glow + floating blobs
  return (
    <>
      {/* radial glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.22),_transparent)]" />
      {/* grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
      {/* scanline */}
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06)1px,transparent_1px,transparent_3px)]" />
      {/* blobs */}
      <motion.div
        className="pointer-events-none absolute right-12 top-24 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl"
        animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute left-10 bottom-24 h-40 w-40 rounded-full bg-amber-300/15 blur-3xl"
        animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      />
    </>
  );
}

function ArcadeCabinet() {
  return (
    <div className="relative">
      <div className="rounded-[20px] border border-white/10 bg-gray-900/60 p-4">
        <div className="rounded-xl border border-white/10 bg-black p-5">
          {/* “screen” */}
          <motion.div
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[16/10] w-full rounded-lg bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,.3),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(250,204,21,.25),transparent_55%),linear-gradient(135deg,rgba(255,255,255,.06),rgba(0,0,0,.2))] overflow-hidden grid place-items-center"
          >
            <div className="text-center">
              <div className="text-6xl">🏏</div>
              <div className="mt-2 text-white/80">Insert fun • Press Start</div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* lights */}
      <div className="absolute -inset-2 -z-10 rounded-[24px] bg-gradient-to-r from-emerald-400/15 via-lime-300/15 to-amber-300/15 blur-2xl" />
    </div>
  );
}

function ModeCard({
  title,
  desc,
  cta,
  href,
  badge,
  icon,
}: {
  title: string;
  desc: string;
  cta: string;
  href: string;
  badge?: string;
  icon?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
    >
      {badge && (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/40">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">
          {icon ?? "⚡"}
        </span>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-white/70">{desc}</p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-gray-900 shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
        >
          {cta}
        </Link>
      </div>
    </motion.div>
  );
}

function StepCard({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-gray-900 text-xs font-extrabold">
        {num}
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-white/70">{text}</p>
    </div>
  );
}

function Ticker() {
  const items = [
    { a: "AR", b: "KB", as: 36, bs: 35, w: "AR" },
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
          <Chip key={i} {...m} />
        ))}
      </motion.div>
    </div>
  );
}

function Chip({ a, b, as, bs, w }: { a: string; b: string; as: number; bs: number; w: string }) {
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
      className={`inline-grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${
        active ? "bg-emerald-400 text-gray-900" : "bg-white/10 text-white/80"
      }`}
    >
      {label}
    </span>
  );
}