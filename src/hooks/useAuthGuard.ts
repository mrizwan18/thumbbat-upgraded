"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard(redirectTo: string) {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace(redirectTo);
    }
  }, [router, redirectTo]);
}