"use client";

import AuthOverlay from "@/components/auth/AuthOverlay";

/**
 * `/login` is now a thin fallback/deep-link route (Sprint 5) — it renders
 * the same `AuthOverlay` the boot sequence shows inline at `/`, so anyone
 * who lands here directly (an old bookmark, or a hard auth-gate redirect
 * from `useAuthGuard`/`middleware.ts`, both left untouched) still gets the
 * new game-account prompt rather than the old full-page tabbed form.
 * All auth state/validation/API logic lives in `useAuthForm`, consumed by
 * `AuthOverlay` — nothing behavioral here. See docs/THUMBBAT_UI_AUDIT.md,
 * Sprint 5.
 */
export default function LoginPage() {
  return <AuthOverlay />;
}
