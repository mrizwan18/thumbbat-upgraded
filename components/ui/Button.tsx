"use client";

import React from "react";
import { motion } from "framer-motion";
import { getButtonClassName, type ButtonVariant, type ButtonSize } from "./buttonStyles";
import { durations } from "./motion";

export interface ButtonProps extends Omit<React.ComponentProps<typeof motion.button>, "ref" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: React.ReactNode;
}

/**
 * The ThumbBat button. Reduced-motion handling is global (see
 * `<MotionConfig reducedMotion="user">` in the root layout) — Framer Motion
 * will automatically drop the transform-based tap feedback for users who
 * prefer reduced motion, so this component doesn't need its own check.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "default", loading = false, disabled, className, children, ...props },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      ref={ref}
      whileTap={isDisabled ? undefined : { y: 3, scale: 0.98 }}
      transition={{ duration: durations.micro }}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={getButtonClassName({ variant, size, className })}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </motion.button>
  );
});

export default Button;
