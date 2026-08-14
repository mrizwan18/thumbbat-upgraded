"use client";

/**
 * @deprecated Email confirmation is no longer used — ThumbBat now only
 * supports Google sign-in. Left in place rather than deleted; do not
 * build new features on this path.
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";

import AppBackground from "@/components/ui/Background";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getButtonClassName } from "@/components/ui/buttonStyles";
import { scaleIn } from "@/components/ui/motion";
import { motion } from "framer-motion";

const Confirm = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL params
    const token = searchParams.get("token");

    if (!token) {
      setErrorMessage("Invalid or missing token.");
      setLoading(false);
      return;
    }

    let timer: NodeJS.Timeout;

    // Call backend to validate the token
    const validateToken = async () => {
      try {
        const response = await axios.get(`/api/auth/confirm?token=${token}`);
        if (response.status === 200) {
          // Successfully confirmed
          toast.success("Account confirmed successfully!");
          setLoading(false);

          // Create separate timer for countdown
          timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
          }, 1000);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        // If token validation fails
        setErrorMessage("Invalid or expired token. Please try again.");
        setLoading(false);
      }
    };

    validateToken();

    // Cleanup timer
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [searchParams]);

  // Separate useEffect for navigation
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/login");
    }
  }, [countdown, router]);

  return (
    <div className="relative min-h-[100svh] text-tb-text-primary overflow-hidden grid place-items-center px-6 py-10">
      <AppBackground variant="website" />

      <motion.div initial={scaleIn.initial} animate={scaleIn.animate} className="w-full max-w-md">
        <Card variant="elevated" className="p-8 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <span
                className="h-10 w-10 animate-spin rounded-full border-2 border-tb-border border-t-tb-primary"
                aria-hidden="true"
              />
              <p className="text-tb-body text-tb-text-secondary">Confirming your account&hellip;</p>
            </div>
          ) : errorMessage ? (
            <>
              <span
                className="mx-auto inline-grid h-12 w-12 place-items-center rounded-tb-pill bg-tb-danger/15 text-tb-danger"
                aria-hidden="true"
              >
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-tb-h2 text-tb-text-primary">Something went wrong.</h2>
              {/* This is an email-confirmation link, never a login session — wording
                  intentionally avoids calling it a "session". */}
              <p className="mt-2 text-tb-body text-tb-text-secondary">
                Your confirmation link is invalid or has expired.
              </p>
              <p className="mt-1 text-tb-caption text-tb-text-muted" role="alert">
                {errorMessage}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/" className={getButtonClassName({ variant: "ghost" })}>
                  Back to home
                </Link>
                <Link href="/login" className={getButtonClassName({ variant: "primary" })}>
                  Log in again
                </Link>
              </div>
            </>
          ) : (
            <>
              <span
                className="mx-auto inline-grid h-12 w-12 place-items-center rounded-tb-pill bg-tb-primary/15 text-tb-primary"
                aria-hidden="true"
              >
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-tb-h2 text-tb-text-primary">You&rsquo;re all set.</h2>
              <p className="mt-2 text-tb-body text-tb-text-secondary">
                Your account has been confirmed.
              </p>
              <p className="mt-1 text-tb-caption text-tb-text-muted">
                Redirecting to login in {countdown}s&hellip;
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push("/login")}>Log in now</Button>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Confirm;
