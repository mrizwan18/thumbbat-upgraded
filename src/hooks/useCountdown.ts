"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdownTo(deadlineMs: number | null) {
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (!deadlineMs) return;
    if (timer.current) clearInterval(timer.current);
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
      setSeconds(left);
      if (left <= 0 && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
    tick();
    timer.current = setInterval(tick, 250);
  }, [deadlineMs]);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [start]);

  return seconds;
}