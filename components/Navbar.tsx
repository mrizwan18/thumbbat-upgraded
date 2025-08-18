"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/game", label: "Play" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ---- login state (SSR-safe) ----
  const checkLoginStatus = () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setDisplayName(localStorage.getItem("username"));
  };

  useEffect(() => {
    checkLoginStatus();

    const onStorage = () => checkLoginStatus();
    const onLogin = () => checkLoginStatus();

    window.addEventListener("storage", onStorage);
    window.addEventListener("login-success", onLogin as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("login-success", onLogin as EventListener);
    };
  }, []);

  // ---- close menus on route change ----
  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [pathname]);

  // ---- click outside to close user menu ----
  useEffect(() => {
    if (!userOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(e.target as Node)
      ) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [userOpen]);

  // ---- ESC key closes mobile + user menus ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
    router.push("/login");
    setIsLoggedIn(false);
  };

  const initial = prefersReducedMotion ? {} : { y: -12, opacity: 0 };
  const animate = prefersReducedMotion ? {} : { y: 0, opacity: 1 };
  const transition = { duration: 0.35, ease: "easeOut" };

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* glow line */}
      <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
      <motion.nav
        initial={initial}
        animate={animate}
        transition={transition}
        className="bg-gray-950/70 backdrop-blur-md border-b border-white/10"
        role="navigation"
        aria-label="Main"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo */}
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="relative inline-block h-16 w-36 rounded-xl overflow-hidden">
                <Image
                  src="/thumbbat-logo.png"
                  alt="ThumbBat logo"
                  fill
                  sizes="(max-width: 768px) 120px, 140px"
                  priority
                  className="object-contain p-1.5"
                />
              </span>
            </Link>

            {/* Center: Desktop nav */}
            <div className="hidden md:flex items-center gap-4">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-2 py-1 text-sm text-white/80 hover:text-white transition-colors"
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    {/* active underline */}
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="active-underline"
                          className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-400 to-lime-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>

            {/* Right: auth/buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/game"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-3.5 py-2 text-gray-900 text-sm font-semibold shadow-[0_8px_30px_rgba(16,185,129,.35)] hover:brightness-95 transition-[filter,transform] active:scale-95"
                  >
                    Play
                  </Link>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      ref={userBtnRef}
                      onClick={() => setUserOpen((v) => !v)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 hover:bg-white/10 transition-colors"
                      aria-haspopup="menu"
                      aria-expanded={userOpen}
                      aria-controls="user-menu"
                    >
                      <Avatar name={displayName || "You"} />
                      <span className="hidden sm:inline text-sm text-white/90">
                        {displayName || "You"}
                      </span>
                      <svg
                        className={`h-4 w-4 text-white/70 transition-transform ${userOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {userOpen && (
                        <motion.div
                          id="user-menu"
                          ref={userMenuRef}
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.16 }}
                          className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-md shadow-lg p-1.5"
                          role="menu"
                        >
                          <Link
                            href="/profile"
                            className="block w-full rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5"
                            role="menuitem"
                            onClick={() => setUserOpen(false)}
                          >
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-white/5"
                            role="menuitem"
                          >
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-xl bg-emerald-400 text-gray-900 text-sm font-semibold hover:brightness-95 transition-[filter]"
                  >
                    Login or Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-gray-950/90 backdrop-blur-md border-b border-white/10"
          >
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-lg px-3 py-2 text-white/90 hover:bg-white/5 ${
                        active ? "bg-white/5" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="mt-2 h-px bg-white/10" />

                {isLoggedIn ? (
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href="/game"
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3 py-2 text-gray-900 font-semibold hover:brightness-95 transition-[filter]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Play
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-rose-300 hover:bg-white/5 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href="/login"
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3 py-2 text-gray-900 font-semibold hover:brightness-95 transition-[filter]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login or Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------- small helpers ---------------------- */

function Avatar({ name }: { name: string }) {
  const initials = (name || "You")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-gray-900 text-xs font-extrabold">
      {initials}
    </span>
  );
}