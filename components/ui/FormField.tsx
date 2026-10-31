import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cx } from "./cx";
import { fadeIn } from "./motion";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
  containerClassName?: string;
  /** Icon/button rendered inside the input's right edge (e.g. a password-visibility toggle). */
  endAdornment?: React.ReactNode;
  /** Keep the label accessible to screen readers but visually hidden (compact controls, e.g. a search bar). */
  hideLabel?: boolean;
  /** Set false to skip the reserved helper-text row entirely when no error/hint will ever be shown (compact controls). Default true. */
  reserveHelperSpace?: boolean;
}

/**
 * The ThumbBat text input (Sprint 1 visual foundation, extended in Sprint 3
 * for the auth forms and Sprint 4 for the Leaderboard search bar).
 *
 * Mirrors the label/input/helper-or-error pattern originally hand-rolled in
 * `src/app/login/page.tsx`'s local `Field` component, tokenized.
 * `endAdornment` was added (Sprint 3) rather than having each consumer
 * absolutely-position a button over the input by hand — it's scoped to a
 * wrapper around just the `<input>`, so it centers correctly regardless of
 * label/helper text height. `hideLabel`/`reserveHelperSpace` were added
 * (Sprint 4) for compact, label-less controls like a search bar — the label
 * stays in the accessibility tree either way. Purely presentational: no
 * validation or submission behavior included or implied.
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  {
    label,
    error,
    hint,
    containerClassName,
    endAdornment,
    hideLabel = false,
    reserveHelperSpace = true,
    id,
    className,
    ...inputProps
  },
  ref
) {
  const inputId = id || React.useId();
  const helperId = `${inputId}-helper`;
  const showHelperRow = reserveHelperSpace || !!error || !!hint;
  return (
    <div className={cx("w-full", containerClassName)}>
      <label
        htmlFor={inputId}
        className={cx(
          "mb-1.5 block text-tb-label uppercase text-tb-text-secondary",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? helperId : undefined}
          className={cx(
            "w-full rounded-tb-md border bg-tb-surface px-4 py-3 text-tb-body text-tb-text-primary outline-none placeholder:text-tb-text-muted",
            "border-tb-border focus:ring-2 focus:ring-tb-primary/60",
            error && "border-tb-danger focus:ring-tb-danger/50",
            !!endAdornment && "pr-11",
            className
          )}
          {...inputProps}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-2 flex items-center">{endAdornment}</div>
        )}
      </div>
      {showHelperRow && (
        <div id={helperId} className="mt-1 min-h-[1.25rem]">
          <AnimatePresence mode="wait" initial={false}>
            {error ? (
              <motion.p
                key="error"
                {...fadeIn}
                className="text-tb-caption text-tb-danger"
                role="alert"
              >
                {error}
              </motion.p>
            ) : hint ? (
              <motion.p key="hint" {...fadeIn} className="text-tb-caption text-tb-text-muted">
                {hint}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});

export default FormField;
