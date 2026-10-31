import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "default" | "sm" | "icon" | "icon-sm";

/**
 * Shared button visual language (Sprint 1, re-themed Sprint 6).
 *
 * This is deliberately a plain className builder, not a polymorphic
 * component, so both the real <Button> element (below) and plain <Link>
 * elements that need to *look* like a button (e.g. Navbar's nav CTAs) can
 * share one definition instead of hand-rolling similar-but-slightly-off
 * class strings.
 *
 * Sprint 6 ("visual foundation") re-treats this as THUMBBAT's game button
 * (the brief's "GameButton") rather than adding a second, near-identical
 * component — a bold border, a chunky bottom-heavy bevel shadow standing in
 * for physical depth, and (primary only) a restrained mint glow. Every
 * existing consumer (auth forms, the boot CTA) picks this up for free.
 * Physical press feedback (translateY + scale) lives on <Button> via
 * Framer's whileTap, not here — see Button.tsx — so non-motion consumers
 * (like <Link>) can add `active:scale-95` themselves without two systems
 * fighting over `transform`.
 */
export function getButtonClassName({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold select-none " +
    "rounded-tb-lg border-2 transition-[filter,transform,background-color,border-color,color,box-shadow] duration-150 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tb-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-tb-bg " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-tb-primary text-tb-bg-elevated border-tb-primary-pressed/60 shadow-tb-button-primary hover:bg-tb-primary-hover",
    secondary:
      "bg-tb-secondary text-white border-tb-secondary-hover/60 shadow-tb-button hover:bg-tb-secondary-hover",
    ghost:
      "bg-transparent border-tb-border text-tb-text-primary shadow-none hover:bg-white/5 hover:border-tb-primary/40",
    danger:
      "bg-tb-danger text-white border-tb-danger-hover/60 shadow-tb-button hover:bg-tb-danger-hover",
  };

  const sizes: Record<ButtonSize, string> = {
    default: "px-5 py-3 text-sm",
    sm: "px-4 py-2 text-sm",
    icon: "h-11 w-11 p-0",
    "icon-sm": "h-9 w-9 p-0",
  };

  return cx(base, variants[variant], sizes[size], className);
}
