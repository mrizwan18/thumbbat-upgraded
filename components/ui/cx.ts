/** Tiny classNames joiner — avoids pulling in a dependency for this alone. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
