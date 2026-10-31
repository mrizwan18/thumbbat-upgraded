# THUMBBAT — Open Questions (Master List)

Every OPEN QUESTION from every discovery document, gathered here for one review pass. Organized by document of origin; nothing here has been answered or decided — that's the point of this list.

---

## From `GAME_BIBLE.md`

1. Is the Unity client expected to talk to the *same* backend deployment/matchmaking pool/leaderboard as the web app (cross-play), or a separate environment?
2. Is the existing web app staying live alongside Unity, or is Unity the eventual full replacement? Affects whether backend fixes are safe to make at all.

## From `GAME_RULES.md`

3. Is the no-over-limit, single-wicket-per-innings format a permanent design decision, or a placeholder that was always meant to get a ball/over cap?
4. Should Unity's practice mode reproduce the exact bot probability matrix (`useBotGame.ts`) for behavioral parity, or is a new bot AI in scope?
5. Should the draw-capable bot logic and the draw-incapable multiplayer logic be reconciled, or is the asymmetry acceptable?

## From `GAME_STATES.md`

6. Should Unity implement the resume/reconnect flow that exists server-side (`resume:join`/`state:snapshot`/`state:pregame`) but is completely unused by the current web client? This seems like an obvious mobile-relevant win but is new client behavior, flagged rather than assumed.
7. Should bot mode gain a real toss ceremony for consistency with multiplayer, or is the faster, toss-less bot start intentional?
8. Is there a plan to add a proper server-side "leave/forfeit a game in progress" capability, or should Unity design around the current reload-only behavior indefinitely?

## From `PLAYER_FLOW.md`

9. Should multiplayer rematch (same opponent, immediately) be a new capability, given the current web app has none at all for multiplayer?
10. Should Private Match's "host must explicitly press Start" step (no auto-toss on both-ready, unlike quick match) be preserved exactly, or adjusted?

## From `NETWORK_PROTOCOL.md`

11. Should Unity replicate the existing client's premature `opponent:left` → immediate game-over display (a likely real bug — the server hasn't given up on reconnect yet at that point), or fix it to only truly end the match on `game:walkover`?
12. `state:snapshot`'s real server payload doesn't cleanly match what the (unused) client handler destructures — is this a known-dormant, never-exercised, possibly-broken path, or is there missing context?
13. Should room-code generation move server-side (removing the current client-authority-over-identifiers quirk), or should Unity replicate the exact client-side algorithm (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, 6 chars)?

## From `BACKEND_CONTRACT.md`

14. How should Unity handle the 1-day JWT expiry with no refresh mechanism — silent re-auth, a longer-lived mobile-specific token, or something else?
15. Is the hardcoded third-party profanity-filter API key (currently shipped in every browser's JS bundle) acceptable to also ship inside a Unity Android binary, or does it need to move server-side first?
16. **Load-bearing:** none of the existing REST endpoints actually check a bearer token/JWT on the request — the only real server-side auth check anywhere is the Next.js middleware's cookie check gating the `/game` *page*. Is adding real API-level JWT authorization in scope as a backend change to support a non-browser client, or must Unity work within this gap somehow?

## From `DATA_MODELS.md`

17. Should the dead `Score` model be revived (e.g., for a "recent matches" list) or deleted as cleanup?
18. `Match.reason`'s code comment lists `"timeout"`/`"manual"` as possible values that no code path actually writes — aspirational, or dead documentation?

## From `VISUAL_DIRECTION.md`

19. Is a professional illustrator/3D artist engaged for the character/environment art, or is an AI-generation pipeline expected? Affects `ASSET_MANIFEST.md` timeline planning.
20. Should the existing gesture-hand photography (`public/images/*.png`) inform the new gesture art's silhouette/readability, or is it fully discarded?

## From `ASSET_MANIFEST.md`

21. **Confirmed gap, not yet resolved:** `arena-home`, `character-player`, `character-opponent`, `result-victory`, `result-defeat`, `result-walkover` do not exist anywhere as real files. Who produces them and on what timeline?
22. Is audio/sound design in scope for this phase at all, or a fully separate, unstarted future effort?

## From `UNITY_ARCHITECTURE.md`

23. UI Toolkit vs uGUI for the Unity UI layer — real technical fork, unresolved.
24. Socket.IO C# client library choice — load-bearing for the entire networking layer, unresolved.
25. Is a backend change (adding real bearer-token REST authorization) in scope to unblock a clean Unity auth architecture? (Same underlying issue as #16, restated at the architecture layer.)
26. Target Unity LTS version, minimum/target Android API level, IL2CPP toolchain specifics, signing/release pipeline, Play Store metadata — none decided.

---

## Suggested triage (not a decision — a starting point for the review conversation)

**Blocking / needs an answer before Phase 2 (real Unity setup) can start meaningfully:**
- #21 (art asset sourcing/timeline)
- #16 / #25 (API auth model — Unity literally cannot make authenticated REST calls today without this being resolved one way or another)
- #23 / #24 (the two foundational Unity technical choices)

**Important, but Unity work can proceed with a documented placeholder/assumption while they're resolved:**
- #1, #2 (deployment/product-strategy questions)
- #6, #8, #9 (reconnect/rematch — real gaps, but existing behavior can be replicated as-is first, improved later)
- #26 (Android build specifics — needed before a real device build, not before architecture work)

**Lower urgency — cleanup/consistency items, not launch-blocking:**
- #3, #4, #5, #7, #10, #17, #18, #19, #20, #22
