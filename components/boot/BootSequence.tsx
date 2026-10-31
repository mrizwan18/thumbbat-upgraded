"use client";

import React, { useEffect, useState } from "react";
import CinematicLoader from "@/components/boot/CinematicLoader";

/**
 * The `/` boot experience (Sprint 5, cinematic direction).
 *
 * The cinematic loader itself *is* the splash/loading screen now — there's
 * no separate "splash" or "loading" phase to manage here. This component's
 * only job is the auth check, exactly the same one the pre-Sprint-5 page.tsx
 * already did in its mount effect (`localStorage.getItem("token")`).
 *
 * `isAuthenticated` starts `false` on both the server render and the
 * client's first render (identical on both sides, so no hydration
 * mismatch), then updates shortly after mount — well before the ~5s
 * cinematic ever finishes, which is the only moment this value is
 * actually consulted (see `CinematicLoader`).
 */
export default function BootSequence() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return <CinematicLoader isAuthenticated={isAuthenticated} />;
}
