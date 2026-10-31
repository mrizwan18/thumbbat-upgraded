# THUMBBAT --- Unity UI/UX Implementation & QA Master Plan

**Document purpose:** Master execution plan for Claude to implement the
THUMBBAT mobile game UI, animations, navigation, loading/error states,
matchmaking flow, and battle presentation in Unity.

**Primary objective:** Convert the approved THUMBBAT visual system and
supplied PNG assets into a production-ready, independently interactable
Unity UI while using the supplied reference video as a motion/UX
benchmark.

**Execution model:** Phase-by-phase, milestone-driven implementation
with APK/device validation after every major milestone.

------------------------------------------------------------------------

## 0. NON-NEGOTIABLE PRODUCT RULES

### 0.1 THUMBBAT visual system is frozen

The approved THUMBBAT homepage and supplied generated assets are the
visual source of truth.

Do not: - redesign the visual language - replace supplied assets with
newly generated alternatives - introduce unrelated colors - change
proportions without a functional reason - flatten the entire UI into one
image - recreate supplied artwork procedurally when the supplied PNG
exists - copy Clash Royale artwork, branding, characters, typography, or
exact layouts

Clash Royale is a **motion, hierarchy, interaction and UX reference
only**.

### 0.2 Every major UI element must remain independently usable

Build reusable Unity components/prefabs for: - profile - currency -
progression/rank - hero caricature - Battle CTA - daily reward -
missions - notification badges - bottom navigation - rewards -
leaderboard - arena opponent/player information - gesture selector -
emote system - leave-match controls - loading/error/reconnection
states - matchmaking state

Dynamic data must remain dynamic Unity UI, not be baked into PNGs.

Examples: - username - level - XP - trophy count - coins - gems -
timers - win percentage - notification count - reward values -
matchmaking status

### 0.3 Mobile-first

Target: - portrait orientation - modern Android/iOS phones - 16:9 -
18:9 - 19.5:9 - 20:9

Use: - Canvas Scaler - safe-area handling - responsive anchors -
responsive RectTransforms - resolution-independent positioning

Important content must never be cropped by notches, rounded corners or
tall aspect ratios.

### 0.4 Animation must be purposeful

THUMBBAT should feel: - energetic - playful - competitive - responsive -
premium - alive

Avoid: - excessive bouncing - generic fades everywhere - constant
animation on every element - slow corporate transitions - particle
spam - unnecessary camera movement - animation that blocks input - fake
loading percentages

------------------------------------------------------------------------

# 1. REFERENCE MATERIAL

Claude must use the supplied reference video as the primary reference
for:

-   launch flow
-   splash behavior
-   loading states
-   connection failure
-   retry behavior
-   homepage hierarchy
-   idle behavior
-   Battle interaction
-   matchmaking
-   cancel behavior
-   match-found transition
-   screen transitions
-   reward interaction
-   notification behavior
-   general animation timing and polish

The reference is **not** a request to clone another game's artwork or
branding.

### THUMBBAT-specific motion language

The core THUMBBAT metaphor is:

> OPPONENT → TENSION → THUMP → IMPACT → RESULT

The game's signature directional motion should frequently use:

``` text
PLAYER  →      ←  OPPONENT
```

followed by a controlled centre impact.

This can be reused across: - splash - match intro - round start -
gesture reveal - major impacts - victory - rematch

------------------------------------------------------------------------

# 2. EXECUTION PROTOCOL FOR CLAUDE

Claude must execute this document in phases.

For each phase:

1.  Inspect the current Unity project.
2.  Inspect existing assets and scripts before creating duplicates.
3.  Implement only the scope of the phase.
4.  Test in Unity Editor.
5.  Run the project.
6.  Capture screenshots/video.
7.  Compare against the supplied visual reference and approved assets.
8.  Fix visual/layout/interaction issues.
9.  Build an APK at the defined milestone.
10. Install and test on a physical Android device where available.
11. Capture the device result.
12. Compare device output against reference.
13. Fix regressions.
14. Record the milestone as PASS only when acceptance criteria are met.
15. Freeze the completed phase before moving on.

Do not move forward simply because the code compiles.

------------------------------------------------------------------------

# 3. MILESTONE QA GATE

Every major milestone must pass all of the following.

## A. Functional

-   no blocking exceptions
-   no broken buttons
-   no missing references
-   no broken navigation
-   no stuck animations
-   no impossible states
-   loading/error states recover correctly
-   Android build launches correctly

## B. Visual

Target **\>95% visual fidelity to the approved THUMBBAT assets and
reference composition**.

This means: - supplied assets are used directly - correct scale -
correct aspect ratio - correct relative positioning - correct visual
hierarchy - correct typography treatment - correct colors - correct
outlines - correct shadows/glows - correct spacing - correct
active/inactive states

The 95% target applies to **THUMBBAT's supplied assets and approved
design**, not to copying the reference game's artwork.

## C. Device

Test on a physical Android device after every major milestone.

At minimum check: - launch - portrait orientation - safe area - touch
targets - scrolling where applicable - animation smoothness - screen
transitions - background scaling - text clipping - notch/status-bar
interaction - back navigation where applicable - application resume
after backgrounding

## D. Performance

Check: - frame stability - excessive allocations - unnecessary particle
systems - oversized textures - duplicated assets - excessive Canvas
rebuilds - animation leaks - inactive screens continuing expensive
updates

------------------------------------------------------------------------

# 4. VISUAL FIDELITY QA METHOD

For each major screen:

### Step 1 --- Reference capture

Capture the intended reference composition.

### Step 2 --- Unity capture

Capture the implementation at the same aspect ratio.

### Step 3 --- Overlay comparison

Use a semi-transparent overlay/difference comparison where possible.

Check: - component bounding boxes - centres - edges - scale - spacing -
typography - asset silhouette - color - visual weight

### Step 4 --- Fix

Prioritize in this order:

1.  wrong/missing asset
2.  wrong component position
3.  wrong scale
4.  wrong hierarchy
5.  wrong spacing
6.  wrong color
7.  wrong typography
8.  wrong animation timing
9.  minor polish

### Acceptance target

Do not call a screen complete until it visually reads as the same
THUMBBAT product at a glance and the supplied assets remain visually
intact.

------------------------------------------------------------------------

# 5. PHASE 0 --- PROJECT AUDIT & TECHNICAL FOUNDATION

## Goal

Understand the existing Unity project before modifying it.

## Tasks

-   inspect Unity version
-   inspect render pipeline
-   inspect current scenes
-   inspect Canvas setup
-   inspect input system
-   inspect package dependencies
-   inspect DOTween availability
-   inspect existing scripts
-   inspect asset folders
-   identify duplicate assets
-   identify existing navigation
-   identify existing networking hooks
-   identify existing audio hooks
-   identify current Android build configuration

Do not rewrite existing systems unnecessarily.

## Deliverables

Create a short project audit:

``` text
Unity version:
Render pipeline:
Canvas:
Input system:
Animation system:
Tween library:
Existing navigation:
Existing networking:
Existing audio:
Android configuration:
Existing reusable components:
Potential conflicts:
```

## Gate

No implementation until the project structure is understood.

------------------------------------------------------------------------

# 6. PHASE 1 --- RESPONSIVE UI FOUNDATION

## Goal

Create the technical foundation that every future screen uses.

## Components

``` text
App
├── EventSystem
├── MainCanvas
│   └── SafeArea
│       ├── BackgroundLayer
│       ├── WorldLayer
│       ├── CharacterLayer
│       ├── UILayer
│       ├── OverlayLayer
│       └── NavigationLayer
└── GlobalSystems
```

## Implement

-   portrait Canvas
-   Canvas Scaler
-   reference resolution
-   safe-area component
-   responsive anchors
-   screen transition manager
-   common animation utility
-   common button feedback
-   common CanvasGroup utilities
-   common audio event hooks
-   common loading overlay
-   common modal overlay

## Do not implement

-   homepage content
-   Battle logic
-   matchmaking
-   rewards logic

## Gate

Test at multiple aspect ratios in Editor.

Build APK and test safe-area behavior on device.

------------------------------------------------------------------------

# 7. PHASE 2 --- ASSET IMPORT & ART DIRECTION LOCK

## Goal

Make the supplied PNG assets production-ready without changing their
appearance.

## Tasks

For every supplied asset: - verify transparency - verify dimensions -
verify pivot - verify import settings - verify filtering - verify
compression - verify mipmap requirements - verify sprite type - verify
correct pixels-per-unit - identify whether it should be 9-sliced or
fixed-size - create logical asset naming

Do not edit artwork unless explicitly requested.

## Asset groups

-   THUMBBAT logos
-   backgrounds
-   caricatures
-   hand gestures
-   profile frames
-   rank/progression assets
-   navigation assets
-   buttons
-   reward/chest assets
-   currency icons
-   notification indicators
-   emotes
-   arena assets

## Gate

Create an asset reference sheet and verify the imported Unity visuals
against source PNGs.

------------------------------------------------------------------------

# 8. PHASE 3 --- SPLASH / APP LAUNCH

## Goal

Implement the existing approved THUMBBAT animated splash.

## Sequence

``` text
APP LAUNCH
↓
THUMBBAT SPLASH
↓
OPPOSING ELEMENTS
↓
APPROACH
↓
THUMP / IMPACT
↓
SEPARATION
↓
LOGO REVEAL
↓
LOGO SETTLE
↓
LOADING / INITIALIZATION
```

## Animation requirements

Use: - anticipation - rapid approach - impact punch - brief flash -
optional subtle screen shake - separation - logo overshoot - logo settle

The animation must be independent from networking.

The splash must never freeze because server initialization is slow.

## Gate

Test: - cold launch - warm launch - slow connection - no connection -
app resume

------------------------------------------------------------------------

# 9. PHASE 4 --- INITIALIZATION / LOADING / CONNECTION STATES

## Goal

Create robust loading and connection UX.

## States

``` text
Initializing
Connecting
Loading
Connected
ConnectionFailed
Retrying
Maintenance
TimedOut
```

## Loading

Use: - THUMBBAT branding - stadium/environment - animated loader

Do not fake percentage progress unless actual progress exists.

## Connection failure

Show:

``` text
Unable to connect

Check your internet connection
and try again.

[ TRY AGAIN ]
```

Keep the branded environment visible.

## Retry

``` text
Error
↓
button press
↓
panel exits
↓
connecting state
↓
success / failure
```

## Server maintenance

Use a separate message from generic connection failure when backend
state supports it.

## Gate

Physically test: - Wi-Fi connected - Wi-Fi disconnected - mobile data
disabled - server unreachable/mock timeout - retry success - retry
failure - app resumed after interruption

------------------------------------------------------------------------

# 10. PHASE 5 --- HOMEPAGE FOUNDATION

## Goal

Build the homepage from independent components.

## Visual hierarchy

``` text
PLAYER IDENTITY
      ↓
PROGRESSION / STATUS
      ↓
HERO CHARACTER
      ↓
BATTLE
      ↓
REWARD
      ↓
NAVIGATION
```

## Components

1.  Stadium background
2.  Player profile card
3.  Currency bar
4.  Progress/rank information
5.  Hero caricature
6.  Battle CTA
7.  Daily reward
8.  Missions
9.  Notification badges
10. Bottom navigation

## Critical rule

Do not flatten these into one background image.

Each is independently controllable.

## Gate

Homepage static composition must achieve \>95% visual fidelity to the
approved THUMBBAT homepage reference.

------------------------------------------------------------------------

# 11. PHASE 6 --- HOMEPAGE INTRO ANIMATION

## Goal

Make the homepage feel like it has loaded into an active game world.

## Sequence

``` text
Background
↓
Player identity
↓
Progression
↓
Hero character
↓
Secondary systems
↓
Battle CTA emphasis
↓
Navigation settles
```

Use staggered timing.

Battle receives the strongest emphasis.

Avoid every element entering simultaneously.

## Gate

Verify: - first-open experience - repeated visits - returning from
Battle - returning from another tab

------------------------------------------------------------------------

# 12. PHASE 7 --- HOMEPAGE IDLE LIFE

## Goal

Make the homepage alive without visual noise.

## Hero

Very subtle: - breathing - micro movement - light sweep

## Background

Very subtle: - ambient lighting - particles - stadium energy

## Battle

Subtle idle pulse.

Suggested concept:

``` text
1.00 → 1.02/1.025 → 1.00
```

No constant bounce.

## Rewards

Occasional subtle attention pulse.

## Notification badges

Animate only when newly appearing.

## Gate

Leave homepage idle for several minutes.

It should remain energetic but not annoying.

------------------------------------------------------------------------

# 13. PHASE 8 --- BATTLE CTA

## Goal

Make Battle the strongest interaction on the homepage.

## States

``` text
Normal
Pressed
Released
Disabled
Searching
```

## Press

Recommended structure:

``` text
anticipation
↓
compress
↓
impact
↓
overshoot
↓
settle
```

Target total duration: \~200--300 ms.

## Event

Expose a clean event:

``` csharp
BattlePressed
```

The visual component should not own matchmaking logic.

## Gate

Verify: - touch response - visual response - sound timing - no double
activation - disabled state - accessibility of touch target

------------------------------------------------------------------------

# 14. PHASE 9 --- MATCHMAKING
> **Implementation status (2026-10-19):** APPROVED and frozen. Real quick match via `queue:join` → existing toss/gameplay hand-off. Report: ThumbBat-Unity `Docs/qa/phase9/PHASE_9_REPORT.md`.

## Goal

Transform Battle into a clear searching state.

## Sequence

``` text
BATTLE TAP
↓
button impact
↓
homepage transition
↓
SEARCHING FOR OPPONENT
↓
search animation
↓
CANCEL available
```

## UI

Keep the THUMBBAT environment visible.

Show: - searching message - animated search indicator - cancel control -
optional gameplay tip

## Timeout

Never allow infinite silent searching.

If backend supports meaningful search expansion, communicate it.

Otherwise use:

``` text
Still searching for an opponent...
```

## Gate

Test: - instant match - 5-second search - long search - cancel -
connection loss - reconnect - server timeout

------------------------------------------------------------------------

# 15. PHASE 10 --- MATCH FOUND / MATCH INTRO
> **Implementation status (2026-10-19):** APPROVED and frozen; server match:stats merged to main (d15fd32) and deployed on Render. Cinematic replaces the Phase 9 placeholder; real win stats via additive server `match:stats`. Report: ThumbBat-Unity `Docs/qa/phase10/PHASE_10_REPORT.md`.

## Goal

Create a major emotional moment.

## Sequence

``` text
SEARCHING...
↓
MATCH FOUND!
↓
impact
↓
player enters
↓
opponent enters
↓
names
↓
win percentages
↓
VS / THUMBBAT impact
↓
arena transition
```

## Signature motion

Use opposing horizontal motion:

``` text
PLAYER →     ← OPPONENT
```

with controlled centre impact.

## Gate

Match intro must feel significantly more energetic than ordinary
navigation.

------------------------------------------------------------------------

# 16. PHASE 11 --- ARENA ENTRY

> **Implementation status (2026-10-19):** APPROVED and frozen (device-verified). Report: ThumbBat-Unity `Docs/qa/phase11/PHASE_11_REPORT.md`.

## Goal

Transition from matchup into actual gameplay.

## Arena

Show: - opponent profile - player profile - caricatures - win
percentage - hands facing each other - small centre gap - gameplay
state - leave match - emote control

No unnecessary ball icon.

## Entry

Use: - directional motion - depth - short impact - settle

## Gate

Verify no overlap or clipping across target aspect ratios.

------------------------------------------------------------------------

# 17. PHASE 12 --- GESTURE SYSTEM

> **Implementation status (2026-10-20):** APPROVED and frozen (device-verified). Report: ThumbBat-Unity `Docs/qa/phase12/PHASE_12_REPORT.md`.

## Goal

Integrate all existing gesture PNGs as independent gameplay assets.

## Structure

``` text
PlayerGesture
├── Rock
├── Paper
├── Scissors
├── Win
├── Lose
└── OutOverlay
```

The OUT state does not require another generated gesture.

Use: - current gesture - red overlay/tint - shake - optional warning
glow

## Gesture reveal

Recommended:

``` text
anticipation
↓
gesture reveal
↓
short hold
↓
opponent reveal
↓
result impact
```

## Gate

Verify every gesture retains the same approved art style and texture.

------------------------------------------------------------------------

# 18. PHASE 13 --- EMOTE SYSTEM

> **Implementation status (2026-10-20):** APPROVED and frozen for internal prototype use; server `feat/emotes` pushed, not merged or deployed. Art is prototype-only (real-cricketer caricatures) behind a release-build guard. Report: ThumbBat-Unity `Docs/qa/phase13/PHASE_13_REPORT.md`.

## Goal

Create a real-time emote system visible to both players.

## Interaction

Tap emote button:

``` text
tray opens upward
↓
small overshoot
↓
emotes selectable
```

Selecting:

``` text
tap
↓
emote pops from player's side
↓
bounce
↓
brief hold
↓
fade
```

The network event must broadcast the selected emote to the opponent.

## Gate

Test: - rapid selection - repeated emotes - remote emote display -
connection interruption - tray closing - no accidental gameplay input

------------------------------------------------------------------------

# 19. PHASE 14 --- LEAVE MATCH

> **Implementation status (2026-10-20):** APPROVED and frozen for internal prototype use (incl. change request). Pushed (Unity `phase-14-leave-match`, server `feat/match-forfeit`); not merged or deployed. Report: ThumbBat-Unity `Docs/qa/phase14/PHASE_14_REPORT.md`.

## Goal

Prevent accidental abandonment.

Use a low-priority leave control.

On tap:

``` text
Leave match?
Are you sure?

[ CONTINUE ] [ LEAVE ]
```

Do not use an oversized destructive button.

## Gate

Test: - cancel - confirm - network state - return to homepage - match
state cleanup

------------------------------------------------------------------------

# 20. PHASE 15 --- HOMEPAGE REWARDS

## Components

-   daily reward
-   chest
-   claim button
-   progress indicators
-   notification badge
-   reward counter

## Claim sequence

``` text
CLAIM
↓
button impact
↓
reward reveal
↓
coins/gems/items emerge
↓
counter updates
↓
reward state becomes CLAIMED
```

Do not instantly teleport counters to their final value if the animation
is intended to communicate reward value.

## Gate

Verify repeated claims cannot occur.

------------------------------------------------------------------------

# 21. PHASE 16 --- BOTTOM NAVIGATION

## Tabs

``` text
HOME
BATTLE
LEADERBOARD
PROFILE
```

## Active state

Use: - stronger highlight - glow - elevated visual weight - active icon
treatment

## Transition

Keep transitions short.

Do not reload the entire UI unnecessarily.

## Gate

Verify: - every tab - active state - back behavior - repeated
switching - animation interruption

------------------------------------------------------------------------

# 22. PHASE 17 --- PROFILE

## Goal

Create reusable player profile UI.

Show dynamic: - avatar/caricature - username - level - XP -
trophies/rank - relevant progression

Do not bake values into PNGs.

## Gate

Test long names and varying values.

------------------------------------------------------------------------

# 23. PHASE 18 --- REWARDS / LEADERBOARD / SECONDARY SCREENS

Implement after the homepage and Battle loop are stable.

Use the same frozen: - palette - borders - depth - iconography -
typography - animation language

Do not introduce a different visual system for secondary screens.

------------------------------------------------------------------------

# 24. PHASE 19 --- AUDIO PASS

Create reusable audio events.

Core events:

``` text
SplashThump
ButtonPress
BattleImpact
SearchStart
MatchFound
GestureReveal
GestureImpact
Win
Lose
RewardClaim
Notification
Emote
Navigation
Error
Reconnect
```

Sound must synchronize with the visual impact.

THUMBBAT's signature sound is the physical **THUMP**.

------------------------------------------------------------------------

# 25. PHASE 20 --- OFFLINE / FAILURE / RECOVERY PASS

Perform deliberate failure testing.

Test:

### Launch

-   no internet
-   slow internet
-   server unavailable
-   timeout

### Homepage

-   connection lost
-   reconnect
-   stale data
-   disabled Battle

### Matchmaking

-   connection lost
-   timeout
-   cancel
-   reconnect

### Gameplay

-   connection lost
-   reconnect
-   unrecoverable failure

### Rewards

-   server failure during claim
-   retry
-   duplicate claim prevention

Every failure state must: - communicate clearly - avoid developer
terminology - preserve useful UI where possible - provide recovery -
never leave the player in an ambiguous frozen state

------------------------------------------------------------------------

# 26. PHASE 21 --- PRODUCT QUALITY, UI/UX & COMPATIBILITY AUDIT

> Added 2026-10-21 at the product owner's request (supplied as "Phase 19";
> renumbered because Phase 19 is the Audio Pass). Placed after Phase 20 and
> before Device QA & APK Milestones (now Phase 22), so remediation lands
> before the release APK milestones.

## Mission

Conduct a comprehensive, evidence-based quality audit of ThumbBat as a mobile game. Evaluate the complete player experience against relevant industry standards and established best practices for mobile games, including:

1. Visual design and consistency
2. UI/UX and interaction design
3. Core gameplay feel, feedback, and clarity
4. Audio quality, mixing, and synchronization
5. Device, resolution, aspect-ratio, and Android compatibility
6. Performance, stability, accessibility, and usability
7. Cross-screen consistency and end-to-end player journeys

This is a dedicated quality-assurance and product-polish phase, not a feature-development phase.

The goal is to identify the biggest gaps between the current game and a polished, commercially credible mobile-game experience, support findings with reproducible evidence, and produce a prioritized remediation plan.

**Do not assume the game is compliant with industry standards simply because tests pass or the game runs on one device.**

## 1. Project context and non-negotiable constraints

ThumbBat is a Unity mobile game targeting Android. The Galaxy S24 Ultra is the current reference device. The project has an existing Home screen, bottom navigation, Profile, Leaderboard, rewards, multiplayer battle loop, match introduction, arena, gesture system, emotes, audio, offline handling and server-backed functionality.

The project has been developed in gated phases. Preserve that discipline.

Before doing anything, inspect the actual repository, current branch, working tree, Master Plan, phase reports, existing architecture, assets, Unity settings, Android configuration, tests, and available audio files.

Use the actual project state as the source of truth. Do not assume that earlier reports describe the current code perfectly.

### Hard constraints

- Do not modify files during the initial audit.
- Do not create a new visual design system.
- Preserve the existing approved palette, typography, borders, depth, icons, animation language, and component patterns.
- Do not change the Home top bar or frozen layouts from earlier phases without explicit approval.
- Do not replace approved art, generate new art, or introduce new audio assets during the audit.
- Do not change gameplay rules, networking protocols, matchmaking, scoring, progression, or server behavior just to make the audit easier.
- Do not fix unrelated bugs opportunistically.
- Do not add packages, plugins, or dependencies without approval.
- Do not commit, push, merge, deploy, or rewrite Git history.
- Do not expose tokens, secrets, private user data, or production credentials in reports or logs.
- Preserve all existing phase gates and release guards.
- Keep prototype-only assets and Development-build restrictions intact.

If Phase 20 is not complete and frozen, stop and report that the prerequisite is unmet. Do not start implementation work.

## 2. Stage A --- Establish the baseline

Inspect and report:

- Current branch, HEAD commit, and working-tree status.
- Available Unity and Android build/test configuration.
- Relevant Master Plan and phase reports.
- All major screens and transitions.
- Existing EditMode, PlayMode, integration, server, and regression tests.
- Existing layout baselines and release/build guards.
- Audio sources, mixers, snapshots, sound effects, music, voice-over, and current audio routing.
- Android target SDK, minimum SDK, orientation rules, safe-area handling, scaling configuration, frame-rate settings, and relevant quality settings.
- Available device-test tooling and connected test devices, if any.

Run safe, non-destructive baseline checks where possible. Record the exact commands, results, and environment.

Do not reset the working tree, clean untracked files, alter project settings, or overwrite developer data.

If a check cannot run, state why. Never invent a test result.

## 3. Stage B --- Visual design audit

Inspect the actual rendered screens and available assets. Evaluate:

### Visual hierarchy and composition
- Is the primary action obvious within the first few seconds?
- Are headings, stats, labels, buttons, badges, and secondary information appropriately prioritized?
- Is there excessive visual competition, clutter, dead space, or inconsistent density?
- Are card sizes, margins, padding, alignment, and spacing consistent?
- Do elements align to a coherent grid?
- Are borders, shadows, gradients, depth, and glow effects consistent with the established design language?

### Typography and readability
- Is text legible at actual mobile viewing size?
- Are font sizes and weights used consistently?
- Are long names, large numbers, missing values, and localized or Unicode text handled safely?
- Are ellipses and wrapping intentional?
- Are critical labels distinguishable from decorative text?
- Is contrast adequate for essential information?

### Color and state communication
- Are colors used consistently for meaning?
- Can players distinguish active, inactive, disabled, loading, error, success, and selected states?
- Is important information conveyed by more than color alone?
- Do effects and highlights compete with gameplay or obscure information?

### Art and rendering quality
- Are sprites stretched, cropped incorrectly, blurred, aliased, or inconsistently scaled?
- Are sprite slicing, UV regions, import settings, and aspect ratios correct?
- Are icons visually consistent in weight and style?
- Are there visible seams, clipping, overlapping elements, or mismatched asset resolutions?

**Deliverable:** a screen-by-screen visual audit with evidence, severity, and recommended changes. Distinguish measurable defects from subjective art-direction preferences.

## 4. Stage C --- UI/UX and interaction audit

Test the player journey, not just individual screens.

Cover:

- Cold launch and initial loading.
- Home screen and bottom navigation.
- Every implemented tab and its back-navigation behavior.
- Daily rewards and claim feedback.
- Profile loading, unavailable state, retry, and placeholder progression labels.
- Leaderboard loading, empty, unavailable and unranked states.
- Matchmaking, match introduction, toss, gameplay, emotes, and match completion.
- Opponent disconnects, voluntary leaving, reconnects, timeouts, and other supported error paths.
- Repeated taps, rapid tab switching, delayed responses, and overlapping UI.
- Android system Back, app backgrounding, resume, and interruption recovery.
- Network loss and restoration wherever reproducible.

Evaluate:

- Discoverability and clarity of actions.
- Number of steps needed for common tasks.
- Feedback after every meaningful action.
- Prevention of accidental destructive actions.
- Loading indicators and perceived waiting time.
- Empty, error, offline, and retry states.
- Whether navigation preserves or resets state appropriately.
- Whether modals, overlays, and touch targets behave correctly.
- Whether important actions can become blocked or inaccessible.
- Whether the interface explains what happened when a request fails.

Measure touch-target dimensions and spacing where possible. Compare them with relevant Android guidance and explain any differences.

Do not assume that a placeholder feature is defective merely because it is unfinished. Evaluate whether its current state is clearly communicated and consistent with the approved phase scope.

## 5. Stage D --- Gameplay feel and feedback audit

Assess the actual implemented gameplay without changing game rules.

Inspect and test:

- Input responsiveness and gesture recognition.
- Input latency and perceived control responsiveness.
- Ball movement, collision feedback, timing, and visual clarity.
- Camera framing and readability of important gameplay events.
- Feedback for legal and illegal actions, wickets, boundaries, misses, and match outcomes where implemented.
- Animation timing, easing, transitions, interruptions, and cancellation.
- Whether important events are visually distinguishable without excessive effects.
- Whether animation or UI overlays delay, obscure, or interfere with gameplay.
- Whether multiplayer state transitions remain clear when network events arrive during animations.
- Whether a player can distinguish their own action from the opponent's action.
- Whether match-end and disconnect outcomes are timely and understandable.

Use repeatable scenarios and available logs, frame captures, or recordings. Separate objective defects from subjective game-feel recommendations.

Do not rebalance gameplay, modify scoring, or change authoritative server behavior during this audit.

## 6. Stage E --- Audio audit

Audio is a first-class part of this phase. Do not mark it complete merely because audio files exist or the project compiles.

Inspect all implemented music, sound effects, voice-over, audio mixers, snapshots, source settings, and trigger points.

Evaluate:

### Technical quality
- Clipping and distortion.
- Excessive noise, hiss, rumble, or unwanted silence.
- Inconsistent loudness between assets.
- Harsh frequencies, excessive bass, or poor intelligibility.
- Abrupt starts and stops, clicks, truncated tails, and audible looping seams.
- Mono/stereo compatibility and channel routing.
- Sample rates, compression, import settings, and memory implications.

### Mix and hierarchy
- Relative loudness of music, gameplay effects, UI sounds, and voice-over.
- Whether voice remains intelligible over music.
- Whether critical gameplay effects remain audible.
- Whether music ducks appropriately where required.
- Whether simultaneous sounds become cluttered or excessively loud.
- Whether repeated effects are fatiguing.
- Whether transitions between menus, matches, and results are coherent.

### Interaction and lifecycle
- Are sounds triggered exactly once at the correct gameplay event?
- Do rapid inputs trigger unintended sound bursts?
- Are audio sources stopped, resumed, or cleaned up correctly?
- Does audio behave properly after app backgrounding and resuming?
- Are mute and volume controls handled consistently where implemented?
- Does audio remain synchronized with animation and gameplay?
- Are missing audio assets or unsupported audio paths handled safely?

Use available tools for waveform, peak, loudness, and clipping analysis where possible. Report measured values only when actually measured. Use listening tests for qualities that cannot be established from metadata alone.

If an audio issue cannot be evaluated without human listening or a physical-device check, explicitly mark it as requiring that check.

Do not invent target loudness values or claim compliance with a platform or broadcast specification without identifying the relevant standard and why it applies to this game.

Do not create or replace audio assets during the audit.

## 7. Stage F --- Device and Android compatibility

Use the Galaxy S24 Ultra as the reference device, but do not treat it as proof of universal Android compatibility.

Evaluate the project against a practical matrix of:

- Different aspect ratios and screen resolutions.
- Tall and short displays.
- Cutouts, camera holes, and system safe areas.
- Android navigation modes and system bars.
- Different refresh rates and frame-rate behavior.
- Low-memory and lower-performance devices, where test hardware is available.
- Different supported Android API levels.
- App pause/resume, interruption, and relaunch.
- Network variability and connection failures.
- Thermal or sustained-performance behavior when it can be measured safely.

Use existing reference resolutions and layout tests. Add no new layout baseline or test-device requirement without approval.

For each unavailable device or environment, explain what remains unverified rather than claiming compatibility.

Inspect:

- UI clipping and scaling.
- Touch-target placement.
- Font rendering and Unicode behavior.
- Sprite and text sharpness.
- Orientation handling.
- Frame-time consistency and dropped frames.
- Startup time and screen-transition latency where measurable.
- Memory and battery concerns where evidence is available.
- Android logs, exceptions, ANRs, and lifecycle failures.
- Build configuration, permissions, and platform compatibility.

Do not claim the game works on every Android device based on a single device pass.

## 8. Stage G --- Accessibility and usability

Evaluate practical mobile accessibility, including:

- Text contrast and minimum readable text size.
- Touch-target size and spacing.
- Reliance on color alone.
- Motion intensity and repeated flashing or pulsing effects.
- Audio-only or visual-only communication of critical events.
- Clear error wording and recovery instructions.
- Legibility of names, numbers, and status indicators.
- Reduced-motion or audio-control support, if currently implemented.

Use recognized guidance such as relevant Android accessibility guidance and WCAG criteria where applicable. Identify the criterion or guidance used and distinguish a formal conformance claim from a practical heuristic.

Do not claim WCAG or Android accessibility conformance unless the scope and evidence support that claim.

## 9. Stage H --- Performance, reliability, and regression

Run the available existing suites and record results separately:

- Unity EditMode tests.
- Unity PlayMode tests, if available.
- Layout baseline and Phase 5–7 regression checks.
- Phase 15 reward regression.
- Phase 16 navigation regression.
- Phase 17 Profile regression.
- Phase 18 Leaderboard regression.
- Phase 19 audio and Phase 20 connectivity regression.
- Server tests and relevant integration tests.
- Android build and device logs.

Measure, where possible:

- Startup and loading time.
- Frame time and frame-rate stability.
- Allocation spikes, garbage collection, and memory use.
- UI rebuild or layout spikes.
- Animation and transition responsiveness.
- Network request latency and timeout behavior.
- Exceptions, warnings, leaked listeners, duplicate callbacks, and lifecycle issues.

Distinguish pre-existing failures from regressions introduced during this phase. Never change unrelated code simply to achieve a green test suite.

If a baseline failure is reproducible, record it as a baseline issue with evidence.

## 10. Stage I --- Industry comparison and severity ranking

Compare findings against relevant, identifiable guidance and established mobile-game UX practices.

Prioritize issues using this scale:

- **P0 — Critical:** crash, data/security issue, progression or match integrity failure, or a defect that blocks normal use.
- **P1 — High:** major gameplay obstruction, serious visual/readability failure, broken core interaction, or severe audio problem.
- **P2 — Medium:** significant inconsistency, confusing feedback, compatibility issue affecting a subset of supported devices, or noticeable polish/performance problem.
- **P3 — Low:** minor polish, small alignment issue, subtle timing inconsistency, or optional enhancement.

For every finding, include:

1. Unique issue ID.
2. Screen, flow, asset, subsystem, or device.
3. Severity and rationale.
4. Reproduction steps.
5. Expected versus actual behavior.
6. Evidence: screenshot, recording, log excerpt, test, measurement, or source location.
7. Whether the issue is confirmed, suspected, or subjective.
8. Relevant industry guidance or reference, if applicable.
9. Recommended fix.
10. Risk, affected phases, and required regression tests.

Do not use generic comments such as "make it more polished" without a specific observation and actionable recommendation.

Do not invent defects to fill the report.

## 11. Stage J --- Produce a remediation proposal, then stop

Create a report in the established phase-documentation location, following the existing report conventions (`ThumbBat-Unity/Docs/qa/phase21/PHASE_21_REPORT.md`).

The report must contain:

- Executive summary and overall quality assessment.
- Exact repository/build/test baseline.
- Screens and journeys inspected.
- Visual and UX findings.
- Gameplay and audio findings.
- Compatibility and accessibility findings.
- Performance and reliability results.
- Test results, including existing failures and unverified checks.
- Prioritized issue register.
- Evidence and reproducible steps.
- Recommended fixes grouped into small, independently reviewable batches.
- Estimated relative effort and risk, without pretending estimates are exact.
- Dependencies and cross-phase impact.
- A proposed order of remediation.
- An explicit list of what was not tested.

Also produce a short release-readiness assessment separating:
1. Functional correctness.
2. Visual and UX quality.
3. Gameplay quality.
4. Audio quality.
5. Compatibility and performance.
6. Release blockers versus optional polish.

A successful build or passing test suite alone must never be presented as proof of release readiness.

## Final gate

**This phase is initially audit-only.**

Do not implement fixes, refactor code, change assets, alter audio, modify layouts, or adjust gameplay as part of the audit.

After producing the report, stop and present:

- The highest-priority findings.
- The evidence supporting each finding.
- Any critical checks that could not be performed.
- Your recommended remediation batches.
- Any findings that require a physical-device or human-listening check.

Wait for explicit approval before implementing any remediation. Each approved batch must preserve the existing phase boundaries and be regression-tested. Keep commits, pushes, merges, and deployments separately gated.

The goal is not to change everything. The goal is to identify what genuinely needs improvement, prove it with evidence, and improve ThumbBat without destabilizing the features that already work.

------------------------------------------------------------------------

# 27. PHASE 22 --- DEVICE QA & APK MILESTONES

Build APKs at these checkpoints:

``` text
APK-01 — Foundation
APK-02 — Splash + Loading + Errors
APK-03 — Complete Homepage
APK-04 — Homepage + Battle + Matchmaking
APK-05 — Match Intro + Arena
APK-06 — Gestures + Emotes
APK-07 — Rewards + Navigation
APK-08 — Feature Complete
APK-09 — Final Polish Candidate
```

At every APK milestone:

1.  Build.
2.  Install on physical device.
3.  Cold launch.
4.  Warm launch.
5.  Test target flow.
6.  Record screen.
7.  Capture screenshots.
8.  Compare against reference.
9.  Fix issues.
10. Rebuild.

Do not wait until the end to discover device-specific layout problems.

------------------------------------------------------------------------

# 28. DEVICE TEST MATRIX

At minimum test:

  Test             Expected
  ---------------- ------------------------------
  Cold launch      Splash starts correctly
  Splash           No black gaps/cropping
  Slow network     Splash does not freeze
  No network       Clear connection state
  Retry            Correct recovery
  Homepage         Correct composition
  Battle           Immediate feedback
  Matchmaking      Searching state visible
  Cancel           Returns safely
  Match found      Correct intro
  Arena            No clipping
  Gesture          Correct reveal
  Emote            Local + remote
  Reward           Correct claim state
  Navigation       Correct active state
  Background app   State preserved/recovered
  Rotation         Portrait behavior controlled
  Low memory       No obvious failure
  Reconnect        Correct recovery

------------------------------------------------------------------------

# 29. VISUAL REGRESSION CHECKLIST

For each completed screen compare:

### Assets

-   correct PNG
-   correct transparency
-   correct silhouette
-   no unintended scaling
-   no texture changes

### Layout

-   correct margins
-   correct anchors
-   correct hierarchy
-   correct spacing
-   correct alignment

### Typography

-   correct font
-   correct weight
-   correct size
-   correct outline/shadow
-   no clipping

### Color

-   correct navy
-   correct blue
-   correct cyan
-   correct yellow/gold
-   correct orange
-   correct white

### Effects

-   correct glow
-   correct outline
-   correct shadow
-   no excessive bloom
-   no random effects

### Motion

-   correct direction
-   correct duration
-   correct easing
-   correct impact
-   correct settle

------------------------------------------------------------------------

# 30. 95% FIDELITY STANDARD

The goal is not "looks roughly similar."

For supplied THUMBBAT assets, the implementation should preserve **at
least 95% of the approved visual identity**.

### High-priority fidelity

These must be essentially exact: - logo - caricatures - hand gestures -
major buttons - major frames - background - icons - reward/chest art -
primary palette - major composition

### Flexible areas

These may be tuned for Unity: - tiny spacing - exact animation curve -
dynamic text length - minor particle timing - safe-area offsets -
backend-driven content

If a supplied asset can be reused directly, **reuse it**.

Do not ask an image model to recreate it.

------------------------------------------------------------------------

# 31. PERFORMANCE REQUIREMENTS

Keep the implementation practical for mobile.

Watch: - texture sizes - Canvas rebuilds - particle count - Animator
count - active-but-hidden objects - update loops - allocations during
animation - unnecessary network polling

Prefer: - event-driven state changes - reusable prefabs - pooled effects
where appropriate - cached references - lightweight tweening - disabled
inactive screens

------------------------------------------------------------------------

# 32. COMPONENT FREEZE RULE

Once a component passes QA:

``` text
APPROVED
↓
FREEZE
```

Future work may integrate with it but must not silently redesign it.

If a change is required:

``` text
CHANGE REQUEST
↓
WHY
↓
EXPECTED IMPACT
↓
IMPLEMENT
↓
RETEST
↓
REFREEZE
```

------------------------------------------------------------------------

# 33. PARALLEL EXECUTION RULES

Claude may parallelize work only when components have no conflicting
dependencies.

### Safe parallel groups

After Phase 1:

``` text
Profile component
Currency component
Navigation component
Reward component
```

can be developed in parallel.

After homepage foundation:

``` text
Battle visual component
Daily reward component
Mission component
Notification component
```

can be developed in parallel.

After arena foundation:

``` text
Gesture presentation
Emote UI
Leave-match UI
Opponent profile
```

can be developed in parallel.

### Do NOT parallelize

These must remain sequential:

``` text
Foundation
→
Splash/loading state machine
→
Homepage composition
→
Battle interaction
→
Matchmaking
→
Match intro
→
Arena
```

because later states depend on earlier navigation and state
architecture.

------------------------------------------------------------------------

# 34. CLAUDE WORK PACKAGE FORMAT

For every task Claude should report:

``` text
PHASE:
TASK:

OBJECTIVE:

ASSETS USED:

FILES CREATED:

FILES MODIFIED:

UNITY HIERARCHY:

INTERACTION STATES:

ANIMATION STATES:

DEPENDENCIES:

IMPLEMENTATION COMPLETE:
YES / NO

EDITOR TEST:
PASS / FAIL

APK TEST:
PASS / FAIL / NOT YET

DEVICE TEST:
PASS / FAIL / NOT YET

VISUAL FIDELITY:
ESTIMATED %

KNOWN ISSUES:

NEXT TASK:
```

------------------------------------------------------------------------

# 35. FINAL END-TO-END ACCEPTANCE TEST

Before release candidate:

## Launch

``` text
Cold launch
→ splash
→ initialization
→ connection
→ homepage
```

## Failure

``` text
Cold launch
→ no internet
→ connection error
→ retry
→ recovery
```

## Homepage

``` text
Profile
Currency
Progression
Hero
Battle
Rewards
Navigation
```

## Battle

``` text
Battle
→ impact
→ matchmaking
→ cancel
```

## Match

``` text
Battle
→ matchmaking
→ match found
→ player/opponent intro
→ arena
```

## Gameplay

``` text
Gesture
→ reveal
→ result
→ emote
→ opponent emote
```

## Recovery

``` text
connection lost
→ reconnect
→ resume
```

## Exit

``` text
leave
→ confirmation
→ homepage
```

------------------------------------------------------------------------

# 36. FINAL POLISH PASS

Only after all functionality works.

Polish in this order:

1.  spacing
2.  alignment
3.  scale
4.  typography
5.  animation timing
6.  button feedback
7.  sound synchronization
8.  micro-interactions
9.  loading polish
10. error polish
11. reward polish
12. performance
13. device-specific fixes

Do not add new features during this phase.

------------------------------------------------------------------------

# 37. FINAL RELEASE CRITERIA

THUMBBAT is ready for release candidate only when:

-   all major flows work
-   no blocking UI bugs remain
-   all supplied assets are correctly integrated
-   visual fidelity is \>95% against the approved THUMBBAT reference
-   splash is correct
-   loading is correct
-   connection failure is correct
-   retry works
-   homepage is correct
-   Battle is responsive
-   matchmaking is clear
-   cancel works
-   match-found transition works
-   arena works
-   gestures work
-   emotes work
-   rewards work
-   navigation works
-   offline/reconnect states work
-   APK works on physical device
-   safe-area behavior works
-   no major performance issues remain

------------------------------------------------------------------------

# 38. OPERATING PRINCIPLE

The project should always follow:

> **BUILD → TEST → COMPARE → FIX → APK → DEVICE → FREEZE**

Never:

> BUILD EVERYTHING → HOPE IT WORKS

The reference video defines the desired **interaction quality and motion
principles**.

The supplied THUMBBAT assets define the desired **visual identity**.

Unity defines the actual **runtime implementation**.

The final result should combine all three without compromising
THUMBBAT's identity.

------------------------------------------------------------------------

# 39. FIRST COMMAND TO CLAUDE

After loading this document, Claude should NOT immediately start coding.

First respond with:

``` text
THUMBBAT IMPLEMENTATION PLAN LOADED.

I will first audit the existing Unity project and map the supplied assets.

I will not redesign the frozen visual system.

I will use the supplied reference video for motion/UX analysis only.

I will work milestone-by-milestone and build APKs at the defined gates.

Starting with PHASE 0 — PROJECT AUDIT.
```

Then execute Phase 0 only.
