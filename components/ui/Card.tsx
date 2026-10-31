import React from "react";
import { cx } from "./cx";

export type CardVariant = "surface" | "elevated" | "glass" | "game";

const variantClassName: Record<CardVariant, string> = {
  surface: "bg-tb-surface border-tb-border",
  elevated: "bg-tb-surface-elevated border-tb-border shadow-tb-elevated",
  glass: "bg-white/5 border-tb-border-subtle backdrop-blur-xl",
  game: "bg-tb-bg-elevated/80 border-tb-border-subtle backdrop-blur-md",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

/**
 * The ThumbBat card surface (Sprint 1).
 *
 * Deliberately just a styled <div> — no forced header/body/footer
 * sub-components. The intended hierarchy (surface → border → title →
 * supporting content → CTA) is a content convention consumers follow with
 * the typography/button tokens, not a compound-component API to learn.
 */
export function Card({ variant = "surface", className, children, ...rest }: CardProps) {
  return (
    <div className={cx("rounded-tb-xl border", variantClassName[variant], className)} {...rest}>
      {children}
    </div>
  );
}

export default Card;
