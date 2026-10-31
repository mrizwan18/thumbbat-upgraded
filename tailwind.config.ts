import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ThumbBat design-system tokens (Sprint 1). Additive only — the
        // default Tailwind palette (gray/emerald/etc.) used throughout the
        // existing app is untouched, so nothing already shipped is affected.
        tb: {
          bg: "var(--tb-bg)",
          "bg-deep": "var(--tb-bg-deep)",
          "bg-elevated": "var(--tb-bg-elevated)",
          surface: "var(--tb-surface)",
          "surface-elevated": "var(--tb-surface-elevated)",
          "surface-pressed": "var(--tb-surface-pressed)",
          border: "var(--tb-border)",
          "border-subtle": "var(--tb-border-subtle)",
          primary: "var(--tb-primary)",
          "primary-hover": "var(--tb-primary-hover)",
          "primary-pressed": "var(--tb-primary-pressed)",
          secondary: "var(--tb-secondary)",
          "secondary-hover": "var(--tb-secondary-hover)",
          success: "var(--tb-success)",
          warning: "var(--tb-warning)",
          danger: "var(--tb-danger)",
          "danger-hover": "var(--tb-danger-hover)",
          "text-primary": "var(--tb-text-primary)",
          "text-secondary": "var(--tb-text-secondary)",
          "text-muted": "var(--tb-text-muted)",
          // Sprint 6 — raw palette tokens for thematic accents (gesture
          // icons, ball motif, glow) distinct from the semantic
          // primary/secondary action colors above.
          mint: "var(--tb-mint)",
          cyan: "var(--tb-cyan)",
          violet: "var(--tb-violet)",
          "ball-red": "var(--tb-ball-red)",
        },
      },
      borderRadius: {
        "tb-sm": "var(--tb-radius-sm)",
        "tb-md": "var(--tb-radius-md)",
        "tb-lg": "var(--tb-radius-lg)",
        "tb-xl": "var(--tb-radius-xl)",
        "tb-pill": "var(--tb-radius-pill)",
      },
      boxShadow: {
        "tb-subtle": "var(--tb-shadow-subtle)",
        "tb-elevated": "var(--tb-shadow-elevated)",
        "tb-modal": "var(--tb-shadow-modal)",
        // Sprint 6 — chunky game-button bevel + restrained glow variants.
        "tb-button": "var(--tb-shadow-button)",
        "tb-button-pressed": "var(--tb-shadow-button-pressed)",
        "tb-button-primary": "var(--tb-shadow-button-primary)",
        "tb-button-primary-pressed": "var(--tb-shadow-button-primary-pressed)",
        "tb-glow-mint": "0 0 24px 2px var(--tb-glow-mint)",
        "tb-glow-cyan": "0 0 24px 2px var(--tb-glow-cyan)",
        "tb-glow-violet": "0 0 24px 2px var(--tb-glow-violet)",
      },
      fontSize: {
        "tb-display": [
          "clamp(2.25rem, 5vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "800" },
        ],
        "tb-h1": [
          "clamp(1.5rem, 3vw, 2.25rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "800" },
        ],
        "tb-h2": ["1.375rem", { lineHeight: "1.3", fontWeight: "700" }],
        "tb-subheading": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "tb-body": ["1rem", { lineHeight: "1.6" }],
        "tb-label": ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "600" }],
        "tb-caption": ["0.75rem", { lineHeight: "1.4" }],
        "tb-score": ["2.5rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "800" }],
        // Sprint 6 — momentary big gameplay-feedback text ("FOUR!", "OUT!").
        // Deliberately larger/heavier than tb-display; this is impact text,
        // not a page headline.
        "tb-feedback": [
          "clamp(2.25rem, 9vw, 4.5rem)",
          { lineHeight: "1", letterSpacing: "-0.01em", fontWeight: "800" },
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
