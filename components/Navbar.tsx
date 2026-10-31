"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { getButtonClassName } from "@/components/ui/buttonStyles";
import { popoverPresence, slideDown } from "@/components/ui/motion";

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

  // Explicit no-op override for reduced motion on the nav's own mount
  // animation (kept as its own check, on top of the app-wide
  // <MotionConfig reducedMotion="user">, to match the existing precedent
  // of disabling this entrance animation outright rather than just
  // softening it).
  const initial = prefersReducedMotion ? {} : slideDown.initial;
  const animate = prefersReducedMotion ? {} : slideDown.animate;

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* glow line */}
      <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-tb-primary/50 to-transparent" />
      <motion.nav
        initial={initial}
        animate={animate}
        className="bg-tb-bg-elevated/70 backdrop-blur-md border-b border-tb-border"
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
                    className="relative px-2 py-1 text-tb-body text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    {/* active underline */}
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="active-underline"
                          className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-tb-primary to-tb-secondary"
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
                    className={getButtonClassName({ variant: "primary", size: "sm" }) + " active:scale-95"}
                  >
                    Play
                  </Link>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      ref={userBtnRef}
                      onClick={() => setUserOpen((v) => !v)}
                      className="inline-flex items-center gap-2 rounded-tb-lg border border-tb-border bg-white/5 px-2.5 py-2 hover:bg-white/10 transition-colors"
                      aria-haspopup="menu"
                      aria-expanded={userOpen}
                      aria-controls="user-menu"
                    >
                      <Avatar name={displayName || "You"} />
                      <span className="hidden sm:inline text-sm text-tb-text-primary">
                        {displayName || "You"}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-tb-text-secondary transition-transform ${userOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence>
                      {userOpen && (
                        <motion.div
                          id="user-menu"
                          ref={userMenuRef}
                          initial={popoverPresence.initial}
                          animate={popoverPresence.animate}
                          exit={popoverPresence.exit}
                          className="absolute right-0 mt-2 w-44 rounded-tb-lg border border-tb-border bg-tb-bg-elevated/95 backdrop-blur-md shadow-tb-elevated p-1.5"
                          role="menu"
                        >
                          <Link
                            href="/profile"
                            className="block w-full rounded-tb-sm px-3 py-2 text-sm text-tb-text-primary hover:bg-white/5"
                            role="menuitem"
                            onClick={() => setUserOpen(false)}
                          >
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 text-left rounded-tb-sm px-3 py-2 text-sm text-tb-danger hover:bg-white/5"
                            role="menuitem"
                          >
                            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
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
                    className={getButtonClassName({ variant: "primary", size: "sm" })}
                  >
                    Login or Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-tb-lg border border-tb-border bg-white/5 text-tb-text-primary hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={slideDown.initial}
            animate={slideDown.animate}
            exit={slideDown.exit}
            className="md:hidden bg-tb-bg-elevated/90 backdrop-blur-md border-b border-tb-border"
          >
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-tb-sm px-3 py-2 text-tb-text-primary hover:bg-white/5 ${
                        active ? "bg-white/5" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="mt-2 h-px bg-tb-border" />

                {isLoggedIn ? (
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href="/game"
                      className={getButtonClassName({ variant: "primary", size: "sm", className: "flex-1" })}
                      onClick={() => setMenuOpen(false)}
                    >
                      Play
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-tb-lg border border-tb-border px-3 py-2 text-tb-danger hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href="/login"
                      className={getButtonClassName({ variant: "primary", size: "sm", className: "flex-1" })}
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
    <span className="inline-grid h-7 w-7 place-items-center rounded-tb-pill bg-gradient-to-br from-tb-primary to-tb-secondary text-tb-bg-elevated text-xs font-extrabold">
      {initials}
    </span>
  );
}
