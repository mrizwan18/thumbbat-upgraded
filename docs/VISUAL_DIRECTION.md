# THUMBBAT — Visual Direction

**This document is explicitly not a redesign brief for the existing React UI.** The current web app's visual layer — cards, centered HTML containers, web-form-styled inputs — is reference material for *behavior*, not for *look*. Per this phase's own framing: the target is a native-feeling mobile game, and the current implementation should not be treated as the final visual design.

---

## EXISTING BEHAVIOR — What visual identity actually exists today

- **Logo:** `public/thumbbat-logo.png` — the one genuinely finished, reusable brand asset.
- **A style/mood reference:** `docs/design/ref.png` — a moodboard (not a shippable asset) showing: the wordmark in a glowing mint treatment, a stylized dark stadium/arena tunnel entrance with light-beam and spark effects, two illustrated cricket-athlete characters (one mint-kit, one violet-kit) each holding a gesture pose, a six-icon gesture reference sheet (thumb-based, deliberately distinct from rock-paper-scissors or emoji hand signs), a cricket ball glyph, a chunky 3D-style "PLAY" button, a compact score/VS card, a "VICTORY" result card, and six named palette swatches: **Deep Indigo, Near-Black Blue, Mint, Cyan, Restrained Violet, Cricket-Ball Red.**
- **A cinematic boot video:** `docs/design/animations/loader.mp4` (source) / `public/media/loader.mp4` (optimized, ~1MB, 720×964, muted) + `public/media/loader-poster.jpg`. This is a real, finished cinematic asset already in the product — the only motion-graphics asset that exists today.
- **Twelve gesture/hand images:** `public/images/{1-6}u.png` (player hand showing 1–6) and `{1-6}c.png` (opponent hand showing 1–6), plus `start.png`/`start-r.png` (idle fists). These are flat, simple raster illustrations of a hand/fist — functional, not "premium mobile game" quality by the standards this phase is asking for, but they are the only actual gesture artwork that exists and are a legitimate starting reference for what a gesture needs to communicate (which finger/thumb configuration = which number).
- **Everything else visible in the current web app** (card borders, gradients, glow effects, button chrome) is CSS/Tailwind, generated across several earlier passes of this same project, explicitly superseded by this phase's direction.

## ASSUMPTION

- The `ref.png` moodboard's **palette** (the six named colors above) is treated as a locked, standing product decision that survives this reset — it came from deliberate art direction, not from the disposable UI. The moodboard's specific *illustration style* (the two character renders, the exact button chrome) is a *reference for mood*, not a literal spec to trace — Unity's actual character/environment art is a separate, later production effort (see `ASSET_MANIFEST.md`), not something this documentation pass produces.
- "Street cricket × esports × neon arcade × cinematic sports game" (this phase's own framing) is the operative creative direction going forward, superseding earlier framing in this project's history that leaned more generically "futuristic arena." Both are compatible with the locked palette; this note exists so a future reader doesn't assume the earlier framing is still primary.

## EXISTING BEHAVIOR — What the current gesture system communicates (and doesn't)

The current 1–6 raster hand images are literal photographs/illustrations of a hand showing that many fingers (a generalized counting-fingers convention), **not** a distinct thumb-cricket-specific gesture language. A prior pass of this project (the now-superseded React rebuild) attempted to design an original, non-emoji, non-rock-paper-scissors gesture system (a "thumb + progressively-added-fingers" convention, with a second thumb for the number six) as a code-only SVG placeholder. That system is documentation of a *design attempt*, not a locked spec — it's mentioned here because "six gestures should feel like physical game controls" is a repeated, emphasized requirement across every phase of this project's direction, and whoever designs the real Unity gesture art should know this was already explored once, with the explicit constraint that it must not resemble rock-paper-scissors, generic emoji hands, or casino hand signals.

## VISUAL PRINCIPLES (restated from this phase's brief, as the standing creative direction)

1. The game world is the primary visual layer — not chrome around content, the content itself.
2. Characters and environment carry the visual identity, not UI decoration.
3. UI is embedded into the game world (diegetic where possible), not a layer of cards floating over a background image.
4. No generic SaaS cards, no dashboard/table composition, no "dark background with centered HTML components" — explicitly called out as the failure mode to avoid.
5. Cinematic composition: depth, atmospheric lighting (not flat gradients), haze, particles, subtle environmental motion.
6. Large typography reserved for dramatic moments (round outcomes, victory/defeat), not routine UI labels.
7. Every major interaction gets a visual response — tactile, immediate.
8. Mobile portrait is the primary target; desktop/tablet are adaptations, not the source of truth.
9. The game should feel alive even when the player is doing nothing (idle motion in the environment/characters).

## Color roles (as specified for this phase — supersedes any earlier, looser palette usage)

| Token | Role |
|---|---|
| Deep indigo / near-black blue | Base environment |
| Mint | Primary player/action color |
| Cyan | Secondary energy accent |
| Restrained violet | Opponent/secondary accent |
| Cricket-ball red | Reserved for critical game moments only (wickets, must-win situations) — explicitly *not* a general-purpose accent |

## OPEN QUESTION

- Is a professional illustrator/3D artist being engaged for `character-player`/`character-opponent`/environment art, or is the expectation that these are AI-generated? This affects `ASSET_MANIFEST.md`'s timeline assumptions and isn't decidable from the existing project.
- Should the existing gesture-hand photography style (`public/images/*.png`) inform the new gesture art's silhouette/readability at all, or is it being fully discarded along with the rest of the pre-reset visual layer? Not assumed either way here.
