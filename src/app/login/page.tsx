"use client";

import React, { useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { env } from "../../env";
import Link from "next/link";

const BACKEND_URL = "/api";
const FILTER_USERNAME = env.NEXT_PUBLIC_FILTER_USERNAME;

type Mode = "login" | "signup";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [uErr, setUErr] = useState<string | null>(null);
  const [eErr, setEErr] = useState<string | null>(null);
  const [pErr, setPErr] = useState<string | null>(null);

  const isLogin = mode === "login";

  // ------- validation helpers -------
  const validatePassword = (password: string) => {
    const lengthCheck = /.{8,}/;
    const upperCaseCheck = /[A-Z]/;
    const numberCheck = /[0-9]/;
    const specialCharCheck = /[!@#$%^&*(),.?":/{}|<>]/;

    if (!lengthCheck.test(password)) return "At least 8 characters.";
    if (!upperCaseCheck.test(password)) return "Include an uppercase letter.";
    if (!numberCheck.test(password)) return "Include a number.";
    if (!specialCharCheck.test(password)) return "Include a special character.";
    return null;
  };

  const fetchBadWords = async (name: string) => {
    const myHeaders = new Headers();
    // Consider moving API key to env var
    myHeaders.append("apikey", "ekDwcLAZDcnm9zA87TYalJxntYLM59qL");

    const req: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: name,
    };

    const res = await fetch("https://api.apilayer.com/bad_words?censor_character=", req);
    return (await res.json()) as { bad_words_list?: string[] };
  };

  const validateUsername = async (name: string) => {
    if (name.length < 3 || name.length > 20) return "3–20 characters required.";
    if (FILTER_USERNAME) {
      try {
        const result = await fetchBadWords(name);
        const bad = result.bad_words_list ?? [];
        if (bad.length > 0) return "Contains inappropriate language.";
      } catch {
        return "Could not validate username. Try again.";
      }
    }
    return null;
  };

  const emailValid = useMemo(() => (!isLogin ? /\S+@\S+\.\S+/.test(email) : true), [email, isLogin]);

  // ------- submit handlers -------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setUErr(null);
    setEErr(null);
    setPErr(null);

    // Validate common fields
    const pErrMsg = validatePassword(pw);
    if (pErrMsg) {
      setPErr(pErrMsg);
      toast.error(pErrMsg);
      return;
    }

    const uErrMsg = await validateUsername(username);
    if (uErrMsg) {
      setUErr(uErrMsg);
      toast.error(uErrMsg);
      return;
    }

    if (!isLogin && !emailValid) {
      const msg = "Enter a valid email.";
      setEErr(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${BACKEND_URL}/auth/login`, { username, password: pw });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        document.cookie = `token=${res.data.token}; path=/`;
        window.dispatchEvent(new Event("login-success"));
        toast.success("✅ Login successful!");
        router.replace("/game");
      } else {
        await axios.post(`${BACKEND_URL}/auth/signup`, { username, password: pw, email });
        toast.success("✅ Signup successful! Check your email to confirm your account.");
        setMode("login");
      }
    } catch (err) {
      const apiMsg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ||
        (isLogin ? "Login failed. Check your credentials." : "Signup failed.");
      toast.error(`❌ ${apiMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ------- UI -------
  return (
    <div className="relative min-h-[100svh] bg-gray-950 text-white overflow-hidden grid place-items-center px-6 py-10">
      <BackgroundDecor />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,.35)]"
      >
        {/* Header / Tabs */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <span className="inline-grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-300 text-gray-900 font-black shadow-[0_8px_30px_rgba(16,185,129,.35)]">
                🏏
              </span>
              <h1 className="text-lg font-semibold tracking-tight">ThumbBat</h1>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              Home
            </Link>
          </div>

          <div className="mt-6 relative rounded-2xl bg-white/5 p-1">
            <div className="grid grid-cols-2 relative">
              {/* moving pill */}
              <motion.div
                className="absolute inset-y-1 w-1/2 rounded-xl bg-gray-900/70"
                initial={false}
                animate={{ left: isLogin ? "0%" : "50%" }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative z-10 py-2 text-sm font-semibold ${
                  isLogin ? "text-white" : "text-white/60"
                }`}
                disabled={loading}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`relative z-10 py-2 text-sm font-semibold ${
                  !isLogin ? "text-white" : "text-white/60"
                }`}
                disabled={loading}
              >
                Signup
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
          {/* Username */}
          <Field label="Username" htmlFor="username" error={uErr}>
            <input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-gray-900/50 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="e.g. rizzwon"
            />
          </Field>

          {/* Email (signup only) */}
          <AnimatePresence initial={false} mode="sync">
            {!isLogin && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <Field label="Email" htmlFor="email" error={eErr}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-gray-900/50 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="you@example.com"
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <Field label="Password" htmlFor="password" error={pErr} hint="Use 8+ chars, 1 uppercase, 1 number, 1 symbol.">
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-gray-900/50 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-emerald-400/60"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all active:scale-[0.98] ${
              isLogin
                ? "bg-emerald-400 text-gray-900 hover:brightness-95"
                : "bg-lime-300 text-gray-900 hover:brightness-95"
            } ${loading ? "opacity-70" : ""}`}
          >
            {loading && (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
            )}
            {isLogin ? "Login" : "Create account"}
          </button>

          {/* Footer links */}
          <div className="mt-4 flex items-center justify-between text-xs text-white/60">
            <Link href="/forgot" className="hover:text-white/90">
              Forgot password?
            </Link>
            <Link
              href={isLogin ? "/signup" : "/login"}
              onClick={(e) => {
                e.preventDefault();
                setMode(isLogin ? "signup" : "login");
              }}
              className="hover:text-white/90"
            >
              {isLogin ? "Create an account" : "Have an account? Log in"}
            </Link>
          </div>
        </form>
      </motion.div>

      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function Field({
  label,
  htmlFor,
  children,
  error,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string | null;
  hint?: string;
}) {
  return (
    <div className="mt-4">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-white/80">
        {label}
      </label>
      {children}
      <div className="mt-1 min-h-[1.25rem]">
        {error ? (
          <p className="text-rose-300 text-xs">{error}</p>
        ) : hint ? (
          <p className="text-white/40 text-[11px]">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function BackgroundDecor() {
  const noiseDataUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 40 40'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E";

  return (
    <>
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,_rgba(34,197,94,.18),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("${noiseDataUrl}")` }}
      />
    </>
  );
}