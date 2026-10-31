"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { env } from "../env";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const BACKEND_URL = "/api";
const POPUP_TIMEOUT_MS = 20000;

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken: () => void;
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: unknown) => void;
  }) => GoogleTokenClient;
}

declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleAccountsOAuth2 } };
  }
}

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => existing.addEventListener("load", () => resolve()));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In."));
    document.head.appendChild(script);
  });
}

/**
 * Wraps Google Identity Services' OAuth2 token-client popup flow (a real,
 * user-gesture-triggered Google sign-in — not a decorative button). The
 * access token it returns is sent to `/api/auth/google`, which verifies it
 * against our own client ID server-side and returns the same session shape
 * `/api/auth/login` does, so everything downstream (storage writes, the
 * `login-success` event, the `/game` redirect) matches the existing
 * username/password flow exactly.
 */
export function useGoogleAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPopupTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return;
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: async (response) => {
            clearPopupTimeout();
            if (!response.access_token) {
              setLoading(false);
              toast.error("❌ Google sign-in was cancelled.");
              return;
            }
            try {
              const res = await axios.post(`${BACKEND_URL}/auth/google`, {
                accessToken: response.access_token,
              });
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("username", res.data.username);
              localStorage.setItem("userId", res.data.userId);
              document.cookie = `token=${res.data.token}; path=/`;
              window.dispatchEvent(new Event("login-success"));
              toast.success("✅ Signed in with Google!");
              router.replace("/game");
            } catch (err) {
              const apiMsg =
                (err as AxiosError<{ error?: string }>).response?.data?.error ||
                "Google sign-in failed.";
              toast.error(`❌ ${apiMsg}`);
            } finally {
              setLoading(false);
            }
          },
          error_callback: () => {
            clearPopupTimeout();
            setLoading(false);
            toast.error("❌ Google sign-in was cancelled.");
          },
        });
      })
      .catch(() => {
        toast.error("❌ Could not load Google Sign-In.");
      });

    return () => {
      cancelled = true;
      clearPopupTimeout();
    };
  }, [router]);

  const signIn = useCallback(() => {
    if (!tokenClientRef.current) {
      toast.error("❌ Google Sign-In isn't ready yet — try again in a moment.");
      return;
    }
    setLoading(true);
    // GIS doesn't reliably call `error_callback` when the popup is blocked
    // outright (as opposed to closed/cancelled by the user), which would
    // otherwise leave the button stuck disabled forever. This timeout is
    // the recovery path for that case.
    clearPopupTimeout();
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      toast.error("❌ Sign-in popup didn't open — check your browser's popup blocker.");
    }, POPUP_TIMEOUT_MS);
    tokenClientRef.current.requestAccessToken();
  }, []);

  return { signIn, loading };
}
