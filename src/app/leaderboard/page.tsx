"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Search, ChevronDown, AlertTriangle } from "lucide-react";

import AppBackground from "@/components/ui/Background";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import { getButtonClassName } from "@/components/ui/buttonStyles";
import { cx } from "@/components/ui/cx";
import { scaleIn } from "@/components/ui/motion";

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
    <div className="relative min-h-[100svh] text-tb-text-primary">
      <AppBackground variant="website" />

      {/* pt- was navbar clearance; the navbar is gone (Sprint 5), so this
          is just top breathing room now. */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 pt-8 sm:pt-10">
        {/* Header */}
        <motion.div initial={scaleIn.initial} animate={scaleIn.animate} className="text-center">
          <p className="text-tb-label text-tb-primary">Competitive rankings</p>
          <h1 className="mt-2 flex items-center justify-center gap-2 text-tb-h1 tracking-tight">
            <Trophy className="h-7 w-7 text-tb-primary" aria-hidden="true" />
            Leaderboard
          </h1>
          <p className="mt-2 text-tb-body text-tb-text-secondary">
            Climb the ranks. Make your mark.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <FormField
              label="Search players"
              hideLabel
              reserveHelperSpace={false}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players…"
              containerClassName="sm:max-w-xs"
              endAdornment={<Search className="h-4 w-4 text-tb-text-muted" aria-hidden="true" />}
            />

            <div className="relative">
              <label htmlFor="leaderboard-sort" className="sr-only">
                Sort by
              </label>
              <select
                id="leaderboard-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "score" | "win")}
                className="w-full appearance-none rounded-tb-md border border-tb-border bg-tb-surface px-4 py-3 pr-9 text-tb-body text-tb-text-primary outline-none focus:ring-2 focus:ring-tb-primary/60 sm:w-auto"
              >
                <option value="score">Sort: High Score</option>
                <option value="win">Sort: Win %</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tb-text-muted"
                aria-hidden="true"
              />
            </div>
          </div>

          <Link href="/signup" className={getButtonClassName({ variant: "primary" })}>
            Create account
          </Link>
        </div>

        {/* Podium */}
        <section aria-label="Top 3 players" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          <AnimatePresence mode="wait">
            {loading ? (
              <React.Fragment key="podium-skeleton">
                <PodiumSkeleton className="sm:order-1" />
                <PodiumSkeleton className="sm:order-2 sm:scale-105" />
                <PodiumSkeleton className="sm:order-3" />
              </React.Fragment>
            ) : podium.length ? (
              podium.map((p, i) => (
                <motion.div
                  key={p.username + i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className={i === 0 ? "sm:order-2" : i === 1 ? "sm:order-1" : "sm:order-3"}
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
              <div key="podium-empty" className="sm:col-span-3">
                <EmptyState />
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Table */}
        <section className="mt-8" aria-label="Full rankings">
          <Card variant="glass" className="overflow-hidden">
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full table-fixed text-left">
                <thead className="sticky top-0 z-10 bg-tb-bg-elevated/90 backdrop-blur-md">
                  <tr className="text-tb-label text-tb-text-muted">
                    <th scope="col" className="w-14 px-3 py-3 sm:w-20 sm:px-4">
                      Rank
                    </th>
                    <th scope="col" className="px-3 py-3 sm:px-4">
                      Player
                    </th>
                    <th scope="col" className="w-20 px-3 py-3 text-right sm:w-32 sm:px-4">
                      High Score
                    </th>
                    <th scope="col" className="w-16 px-3 py-3 text-right sm:w-24 sm:px-4">
                      Win %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)
                  ) : err ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <AlertTriangle className="h-6 w-6 text-tb-danger" aria-hidden="true" />
                          <p className="text-tb-body text-tb-danger">{err}</p>
                        </div>
                      </td>
                    </tr>
                  ) : rest.length ? (
                    rest.map((p, idx) => (
                      <tr
                        key={p.username + idx}
                        className="group border-t border-tb-border-subtle transition-colors hover:bg-white/5"
                      >
                        <td className="px-3 py-3 sm:px-4">
                          <RankBadge rank={idx + 4} />
                        </td>
                        <td className="min-w-0 px-3 py-3 sm:px-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={p.username} />
                            <span className="min-w-0 truncate font-medium">{p.username}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums sm:px-4">{p.highScore}</td>
                        <td className="px-3 py-3 text-right tabular-nums sm:px-4">
                          {p.winPercentage}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-tb-text-secondary">
                        No more players to show.{" "}
                        <Link className="text-tb-primary underline" href="/signup">
                          Join now
                        </Link>{" "}
                        and grab a spot!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* CTA band */}
        <section className="mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <Card variant="elevated" className="p-6 text-center md:p-8">
              <h3 className="text-tb-h2 tracking-tight">Your name belongs up here.</h3>
              <p className="mt-2 text-tb-body text-tb-text-secondary">
                Create an account and start climbing the ranks today.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/signup" className={getButtonClassName({ variant: "primary" })}>
                  Create account
                </Link>
                <Link href="/login" className={getButtonClassName({ variant: "ghost" })}>
                  I already play
                </Link>
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

/* =================== UI Bits =================== */

function getInitials(name: string) {
  return (name || "P")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const initials = getInitials(name);
  return (
    <span
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-tb-pill bg-gradient-to-br from-tb-primary to-tb-secondary font-extrabold text-tb-bg-elevated",
        size === "lg" ? "h-14 w-14 text-lg" : "h-8 w-8 text-xs"
      )}
    >
      {initials}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <div
      className="inline-flex h-8 w-8 items-center justify-center rounded-tb-pill bg-white/10 text-sm font-bold tabular-nums text-tb-text-secondary"
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </div>
  );
}

const PODIUM_TONE: Record<number, string> = {
  1: "border-tb-primary/40 bg-gradient-to-br from-tb-primary/15 to-transparent",
  2: "border-tb-border bg-white/5",
  3: "border-tb-border bg-gradient-to-br from-tb-secondary/10 to-transparent",
};

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
  const isFirst = rank === 1;
  return (
    <Card
      variant="surface"
      className={cx(
        "relative border p-5 text-center",
        PODIUM_TONE[rank],
        isFirst && "sm:pb-6 sm:pt-7 sm:shadow-tb-elevated"
      )}
    >
      {isFirst && (
        <Trophy
          className="mx-auto mb-1 h-6 w-6 text-tb-primary"
          aria-hidden="true"
        />
      )}
      <div className="flex flex-col items-center gap-2">
        <Avatar name={username} size={isFirst ? "lg" : "sm"} />
        <div>
          <div className="font-semibold">{username}</div>
          <div className="text-tb-caption text-tb-text-muted">Rank #{rank}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-tb-md border border-tb-border-subtle bg-white/5 px-3 py-2">
          <div className="text-tb-caption text-tb-text-muted">High Score</div>
          <div className={cx("mt-1 font-bold tabular-nums", isFirst ? "text-lg" : "text-base")}>
            {score}
          </div>
        </div>
        <div className="rounded-tb-md border border-tb-border-subtle bg-white/5 px-3 py-2">
          <div className="text-tb-caption text-tb-text-muted">Win %</div>
          <div className={cx("mt-1 font-bold tabular-nums", isFirst ? "text-lg" : "text-base")}>
            {win}%
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card variant="surface" className="flex flex-col items-center gap-3 p-8 text-center">
      <Trophy className="h-8 w-8 text-tb-text-muted" aria-hidden="true" />
      <div>
        <p className="text-tb-subheading text-tb-text-primary">No rankings yet.</p>
        <p className="mt-1 text-tb-body text-tb-text-secondary">Be the first champion.</p>
      </div>
      <Link href="/login" className={getButtonClassName({ variant: "primary", size: "sm" })}>
        Play now
      </Link>
    </Card>
  );
}

/* ===== Skeletons ===== */

function RowSkeleton() {
  return (
    <tr className="animate-pulse border-t border-tb-border-subtle">
      <td className="px-3 py-3 sm:px-4">
        <div className="h-8 w-8 rounded-tb-pill bg-white/10" />
      </td>
      <td className="px-3 py-3 sm:px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-tb-pill bg-white/10" />
          <div className="h-4 w-32 rounded bg-white/10" />
        </div>
      </td>
      <td className="px-3 py-3 sm:px-4">
        <div className="ml-auto h-4 w-12 rounded bg-white/10" />
      </td>
      <td className="px-3 py-3 sm:px-4">
        <div className="ml-auto h-4 w-10 rounded bg-white/10" />
      </td>
    </tr>
  );
}

function PodiumSkeleton({ className }: { className?: string }) {
  return (
    <div className={cx("animate-pulse", className)}>
      <Card variant="surface" className="flex flex-col items-center gap-3 p-5">
        <div className="h-14 w-14 rounded-tb-pill bg-white/10" />
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="h-12 rounded-tb-md bg-white/10" />
          <div className="h-12 rounded-tb-md bg-white/10" />
        </div>
      </Card>
    </div>
  );
}
