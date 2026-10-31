"use client";

import { useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { env } from "../env";

const BACKEND_URL = "/api";
const FILTER_USERNAME = env.NEXT_PUBLIC_FILTER_USERNAME;

export type AuthMode = "login" | "signup";

/**
 * Extracted verbatim from the pre-Sprint-5 `src/app/login/page.tsx` (Sprint 5)
 * so both the compact `AuthOverlay` and the standalone `/login` fallback
 * route can share one implementation instead of duplicating it. Behavior is
 * byte-identical to before this extraction — same validators, same API
 * calls, same storage writes, same redirects, same toasts. This is also the
 * seam a future Google OAuth action would hang off of (per product
 * direction), without redesigning either UI consumer.
 */
export function useAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
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

  // ------- submit handler -------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setUErr(null);
    setEErr(null);
    setPErr(null);

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
        localStorage.setItem("userId", res.data.userId);
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

  return {
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
  };
}
