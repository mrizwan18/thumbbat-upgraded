"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Player = {
  username: string;
  highScore: number;
  winPercentage: number;
};

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "win">("score");

  // Fetch leaderboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/api/leaderboard");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        if (mounted) setPlayers(data);
      } catch (e) {
        console.error("Leaderboard fetch failed:", e);
        if (mounted) {
          setErr("Couldn’t load the leaderboard. Try again shortly.");
          setPlayers([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? players.filter((p) => p.username.toLowerCase().includes(q))
      : players.slice();

    base.sort((a, b) =>
      sortBy === "score"
        ? b.highScore - a.highScore
        : b.winPercentage - a.winPercentage
    );
    return base;
  }, [players, search, sortBy]);

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3, 25); // show first 25 rows

  return (
    <div className="relative min-h-[100svh] bg-gray-950 text-white">
      <BackgroundDecor />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            🏆 Leaderboard
          </h1>
          <p className="mt-2 text-white/70">
            Think you can top the board? Jump in and prove it.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players…"
                className="w-64 rounded-2xl border border-white/10 bg-gray-900/60 px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                ⌕
              </span>
            </div>
            <div>
              <label className="mr-2 text-sm text-white/60">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "score" | "win")
                }
                className="rounded-xl border border-white/10 bg-gray-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/60"
              >
                <option value="score">High Score</option>
                <option value="win">Win %</option>
              </select>
            </div>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-4 py-2 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
          >
            Create account
          </Link>
        </div>

        {/* Podium */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AnimatePresence>
            {loading ? (
              [0, 1, 2].map((i) => <PodiumSkeleton key={i} />)
            ) : podium.length ? (
              podium.map((p, i) => (
                <motion.div
                  key={p.username + i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PodiumCard
                    rank={i + 1}
                    username={p.username}
                    score={p.highScore}
                    win={p.winPercentage}
                  />
                </motion.div>
              ))
            ) : (
              <div className="sm:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
                No players yet—be the first champion!
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Table */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="max-h-[60vh] overflow-auto">
              <table className="min-w-full text-left">
                <thead className="sticky top-0 bg-gray-950/70 backdrop-blur-md">
                  <tr className="text-xs uppercase tracking-wide text-white/60">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">High Score</th>
                    <th className="px-4 py-3">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <RowSkeleton key={i} />
                    ))
                  ) : err ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-rose-300"
                      >
                        {err}
                      </td>
                    </tr>
                  ) : rest.length ? (
                    rest.map((p, idx) => (
                      <motion.tr
                        key={p.username + idx}
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ duration: 0.12 }}
                        className="border-t border-white/5"
                      >
                        <td className="px-4 py-3">
                          <RankBadge rank={idx + 4} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.username} />
                            <span className="font-medium">{p.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {p.highScore}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {p.winPercentage}%
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-white/70"
                      >
                        No more players to show. <Link className="text-emerald-300 underline" href="/signup">Join now</Link> and grab a spot!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-lime-400/10 to-amber-300/10 p-6 md:p-8 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              Your name belongs up here.
            </h3>
            <p className="mt-2 text-white/70">
              Create an account and start climbing the ranks today.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-gray-900 font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-white/90 hover:bg-white/5 transition-colors"
              >
                I already play
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

/* =================== UI Bits =================== */

function BackgroundDecor() {
  const noise =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 40 40'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E";
  return (
    <>
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.18),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("${noise}")` }}
      />
    </>
  );
}

function getInitials(name: string) {
  return (name || "P")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-gray-900 text-xs font-extrabold">
      {initials}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "from-yellow-300 to-amber-400"
      : rank === 2
      ? "from-gray-300 to-gray-500"
      : rank === 3
      ? "from-orange-300 to-orange-500"
      : "from-white/10 to-white/10";
  return (
    <div
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${colors} text-gray-900 font-bold`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </div>
  );
}

function Medal({ rank }: { rank: number }) {
  const icon = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  return <span className="text-2xl">{icon}</span>;
}

function PodiumCard({
  rank,
  username,
  score,
  win,
}: {
  rank: number;
  username: string;
  score: number;
  win: number;
}) {
  const bg =
    rank === 1
      ? "from-yellow-300/15 to-amber-300/10"
      : rank === 2
      ? "from-gray-300/15 to-gray-200/5"
      : "from-orange-300/15 to-amber-200/5";
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${bg} p-5`}>
      <div className="flex items-center gap-3">
        <Medal rank={rank} />
        <div className="flex items-center gap-3">
          <Avatar name={username} />
          <div>
            <div className="font-semibold">{username}</div>
            <div className="text-xs text-white/60">Rank #{rank}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="text-white/60">High Score</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{score}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="text-white/60">Win %</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{win}%</div>
        </div>
      </div>
    </div>
  );
}

/* ===== Skeletons ===== */

function RowSkeleton() {
  return (
    <tr className="border-t border-white/5 animate-pulse">
      <td className="px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-white/10" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div className="h-4 w-32 rounded bg-white/10" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 rounded bg-white/10" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-10 rounded bg-white/10" />
      </td>
    </tr>
  );
}

function PodiumSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div>
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="mt-2 h-3 w-20 rounded bg-white/10" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-12 rounded-xl bg-white/10" />
        <div className="h-12 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}