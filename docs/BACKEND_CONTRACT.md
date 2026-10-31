# THUMBBAT — Backend Contract (REST + Auth)

Two separate backend processes exist today; Unity needs to talk to both.

1. **The Next.js app** (`src/app/api/**`) — REST endpoints, runs inside the Next.js server process.
2. **The Socket.IO server** (`server/socket-server.ts`) — real-time gameplay, a completely separate process/port. See `NETWORK_PROTOCOL.md`.

They share one MongoDB database but do not share a session mechanism — the socket server never validates a JWT; it trusts whatever `userId`/`name` the client tells it via `me:setUser` (see `NETWORK_PROTOCOL.md`).

---

## EXISTING BEHAVIOR — REST endpoints

| Endpoint | Method | Body / Query | Response |
|---|---|---|---|
| `/api/auth/login` | POST | `{ username, password }` | `{ token, username, userId, highScore, message }` on success. `400` for not-found/bad-password/unconfirmed, `500` on server error |
| `/api/auth/signup` | POST | `{ username, email, password }` | `{ message }` — creates an unconfirmed user, emails a confirmation link via Resend. Does **not** return a token (must confirm first, then log in separately) |
| `/api/auth/google` | POST | `{ accessToken }` (a Google OAuth2 access token obtained client-side via Google Identity Services) | Same success shape as `/login` — server verifies the token against Google's `tokeninfo`/`userinfo` endpoints, finds-or-creates a `User` by email, issues the same JWT |
| `/api/auth/confirm` | GET | `?token=<plaintext>` (query) | Hashes the token, looks it up in `VerificationToken`, flips `User.isConfirmed`/`emailVerifiedAt` if valid/unused/unexpired |
| `/api/auth/confirm` | POST | *(same idea, alternate transport — both exist)* | |
| `/api/auth` (legacy) | GET/POST | Plaintext `confirmationToken` field on `User` directly | **Confirmed dead/superseded** — the real confirm flow uses `/api/auth/confirm` with the hashed-token `VerificationToken` model. This legacy route still exists in the codebase and the `User` model still has the plaintext `confirmationToken` field, but nothing in the current UI links to this route |
| `/api/leaderboard` | GET | none | `{ data: [{username, highScore, winPercentage}], success: true }`, sorted by `winPercentage` desc then `highScore` desc, capped at 50. Returns `{data: [], message}` (200) if empty, `503` if DB not connected, `500` on other errors |

## EXISTING BEHAVIOR — Auth contract details

- **Password rules (client-enforced, not server-enforced beyond hashing):** 8+ characters, at least one uppercase letter, one number, one special character (`useAuthForm.ts`'s `validatePassword`). The server (`/api/auth/signup`) does not re-validate this — it will accept any string the client sends. **A Unity client must implement this same validation independently or accept weaker enforcement**, since the backend doesn't do it for you.
- **Username rules:** 3–20 characters. Optionally (env-flag gated, `NEXT_PUBLIC_FILTER_USERNAME`) checked against a third-party profanity API (`api.apilayer.com/bad_words`) using an API key **hardcoded in the client source** (`useAuthForm.ts`) — a pre-existing security smell in the current codebase, not introduced by this documentation pass, flagged for awareness.
- **JWT:** `jsonwebtoken`, signed with `JWT_SECRET` env var, `{ userId }` payload, 1-day expiry. No refresh-token mechanism exists — a session simply expires after 24h and the user must log in again.
- **Google OAuth verification (server-side, `/api/auth/google`):** the access token is checked against `https://oauth2.googleapis.com/tokeninfo` (confirms `aud` matches this app's client ID — rejects tokens issued to a different app) and then `https://www.googleapis.com/oauth2/v3/userinfo` (fetches the verified profile). A brand-new Google sign-in auto-generates a username from the profile name/email and a random unusable password hash (the account has no real password; only Google sign-in works for it unless the user separately sets one, which there is currently no UI for).
- **Session storage (web-specific, informs but doesn't dictate Unity's approach):** `localStorage.token`/`username`/`userId`, **plus** a `token` cookie that's the actual mechanism `src/middleware.ts` checks server-side. A Unity client has no cookie jar in the browser sense — it will need its own decision for how it attaches the JWT to requests (see `OPEN_QUESTIONS.md`); this is not something the existing code answers, since it was never designed for a non-browser client.

## EXISTING BEHAVIOR — `next.config.ts` build posture

`eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` are both set — the existing web app's CI/build does not fail on type or lint errors. Irrelevant to Unity directly, but relevant context for how much to trust "it builds" as a correctness signal when reading the existing source.

## ASSUMPTION

- Unity will call these same REST endpoints directly over HTTPS, sending the JWT as a bearer token (`Authorization: Bearer <token>`) rather than relying on a cookie — this is the standard mobile-client pattern, but it is **not implemented anywhere in the current backend**; every existing route reads the JWT from a cookie (middleware) or doesn't check auth at all (the API routes themselves largely don't verify the JWT on the request — they issue tokens but `/api/leaderboard`, for instance, has no auth check at all, and the socket server never validates the JWT either). This assumption is stated explicitly because it is *not* proven by the existing code — flagged, not asserted as fact.

## OPEN QUESTION

- Does any existing route actually *require* a valid JWT to be sent on the request itself, or is `token` only ever produced (login/signup/google) and checked at the Next.js middleware layer (route-level page gating, not API-level authorization)? Confirmed from reading every route handler: **none of `/api/auth/*` or `/api/leaderboard` inspect an incoming Authorization header or JWT at all.** The only real server-side authorization check anywhere is `src/middleware.ts` gating the `/game` *page* via the `token` cookie. This means, as of today, there is no API-level bearer-token authorization contract for Unity to plug into — one may need to be added, which is a backend change and explicitly out of scope for this documentation pass to decide.
- How should Unity handle the 1-day JWT expiry with no refresh mechanism — silent re-login prompts, a longer-lived token issued specifically for mobile, or something else? Not decidable from existing behavior since mobile wasn't a consideration when this was built.
- Is the hardcoded third-party profanity-filter API key (in client source, shipped to every browser today) acceptable to also ship inside a Unity binary, or does it need to move server-side before a wider mobile release? Flagging as a pre-existing security concern surfaced by this discovery pass, not something silently carried forward without note.
