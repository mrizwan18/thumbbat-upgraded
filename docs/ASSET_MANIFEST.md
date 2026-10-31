# THUMBBAT — Asset Manifest

## EXISTING BEHAVIOR — Assets that exist today, verified on disk

| Asset | Path | Spec | Reusable for Unity as-is? |
|---|---|---|---|
| Logo | `public/thumbbat-logo.png` | PNG, transparent | Yes — the one finished brand asset |
| Boot cinematic (optimized) | `public/media/loader.mp4` | H.264, 720×964, ~1.06 MB, muted, ~5s | Maybe, as a reference/placeholder — a native mobile game may want a different aspect ratio or a from-scratch cinematic; usable immediately if not |
| Boot cinematic (source) | `docs/design/animations/loader.mp4` | H.264+AAC, 2488×3332, ~20 MB | Source file, higher-res than the optimized version |
| Boot poster frame | `public/media/loader-poster.jpg` | JPEG, 720×964 | Yes, if the same video is reused |
| Gesture hand images (player) | `public/images/{1-6}u.png` | Flat raster, hand/fist showing N | Reference only — see `VISUAL_DIRECTION.md`, not "premium mobile game" quality by this phase's own standard |
| Gesture hand images (opponent) | `public/images/{1-6}c.png` | Same, mirrored/recolored variant | Reference only |
| Idle hand images | `public/images/start.png`, `public/images/start-r.png` | Idle fist, player/opponent | Reference only |
| Visual/art moodboard | `docs/design/ref.png` | Single composite image, not sliced assets | Reference/mood only — not a sliced, usable asset |
| Old-UI screenshots (24 total) | `docs/design/current/*.png` | Screenshots of the pre-reset SaaS UI | Historical reference only — explicitly not visual direction |
| Rebuild-attempt screenshots | `docs/design/screenshots/*.jpg` | Screenshots from the (also superseded) React game-client rebuild attempt | Historical reference only |
| Unused starter SVGs | `public/{file,globe,next,vercel,window}.svg` | Next.js default template assets | Not usable — confirmed unreferenced by any app code (from the original Sprint 0 audit of this project) |

## OPEN QUESTION — Assets named in this phase's brief that do not exist

None of the following exist anywhere in the repository as real image/video/audio files (confirmed via full-repository search immediately before this documentation pass, and reconfirmed now): `arena-home`, `character-player`, `character-opponent`, `result-victory`, `result-defeat`, `result-walkover`. This was already surfaced and explicitly flagged to the user in this same project once before (a prior phase paused specifically on this gap). Restating here as a formal, documented open item rather than assuming they'll appear:

- **Who is producing these, and on what timeline?** (illustrator, 3D artist, AI pipeline, stock asset licensing — not decidable from this codebase)
- **What format/resolution/aspect ratio does Unity actually need them in**, given mobile-portrait-first and Android's range of screen densities? This is a Unity-side technical spec question, addressed provisionally in `UNITY_ARCHITECTURE.md`'s asset-pipeline section, but the *content* of the assets is not something this documentation can specify.

## ASSUMPTION — Provisional Unity asset slots (naming, not content)

Until real art exists, these are the logical slots a Unity asset-pipeline/addressables setup should reserve, named to match this phase's brief exactly so a drop-in later doesn't require renaming references throughout the project:

| Slot key | Kind | Suggested use |
|---|---|---|
| `arena-home` | Texture/Sprite (or a lightweight 3D environment) | Home/title screen backdrop |
| `character-player` | Sprite/3D model, transparent-friendly | Generic "you" athlete — not tied to a specific real user's likeness |
| `character-opponent` | Sprite/3D model | Generic "opponent" athlete |
| `result-victory` | Texture/Sprite (or short video loop) | Result screen, win state |
| `result-defeat` | Texture/Sprite (or short video loop) | Result screen, loss state |
| `result-walkover` | Texture/Sprite (or short video loop) | Result screen, opponent-disconnected state — distinct from a normal loss, per this phase's explicit "walkover" callout |
| Gesture set (1–6) | Sprite sheet or per-number sprites, each with default/selected/revealed states | Replaces `public/images/*.png` with a real thumb-cricket-specific gesture language — see `VISUAL_DIRECTION.md`'s open question on whether existing gesture photography informs this |
| Cricket ball | Sprite/3D model | Small recurring motif — reserved for "critical game moments" red accent per `VISUAL_DIRECTION.md` |

No asset in this table has content yet. This table exists so Unity's addressable/asset-reference architecture (see `UNITY_ARCHITECTURE.md`) can be built and tested against placeholders **without those placeholders being mistaken for final art** — consistent with the explicit instruction elsewhere in this project not to let CSS/code placeholders masquerade as finished visuals.

## OPEN QUESTION

- Is audio in scope for this phase's asset pipeline at all? Nothing in the existing codebase has any real audio (a prior phase built a no-op `playSfx()` service specifically because no audio files existed) — flagging that sound design is a fully open, unstarted area, not merely "assets pending."
