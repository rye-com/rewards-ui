/**
 * Tiny class-name joiner. Components ship as source partners own, so we
 * deliberately avoid `clsx` + `tailwind-merge` to keep dependency surface at
 * zero. Partners drop those in if/when they need conflict resolution.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
