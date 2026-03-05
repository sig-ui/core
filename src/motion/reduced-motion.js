// @ts-check

/**
 * SigUI core motion module for reduced motion.
 * @module
 */
/**
 * getReducedMotionAlternative.
 * @param {AnimationType} animationType
 * @returns {ReducedMotionAlternative}
 */
export function getReducedMotionAlternative(animationType) {
  switch (animationType) {
    case "slide":
      return {
        strategy: "crossfade",
        description: "Replace slide with a crossfade (opacity 0→1). " + "Removes spatial movement while preserving the enter/exit cue. " + "Use duration-normal (200ms) for the opacity transition.",
        durationOverride: 200
      };
    case "scale":
      return {
        strategy: "instant",
        description: "Replace scale animation with an instant state change. " + "Scale transforms can trigger vestibular discomfort. " + "If a visual cue is needed, use an opacity flash (duration-faster: 100ms).",
        durationOverride: 0
      };
    case "fade":
      return {
        strategy: "reduce-duration",
        description: "Preserve the fade animation but shorten its duration. " + "Opacity changes are vestibular-safe. " + "Use duration-faster (100ms) instead of the full duration.",
        durationOverride: 100
      };
    case "expand":
      return {
        strategy: "instant",
        description: "Replace expand/collapse with an instant show/hide. " + "Height animation is both a vestibular trigger and a layout-thrashing operation. " + "If a visual cue is needed, crossfade the content at duration-fast (150ms).",
        durationOverride: 0
      };
    case "rotate":
      return {
        strategy: "none",
        description: "Remove rotation animation entirely. " + "Rotation is purely decorative and has no functional replacement. " + "The final rotated state should be applied instantly.",
        durationOverride: 0
      };
  }
}
/**
 * isReducedMotion.
 * @returns {boolean}
 */
export function isReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/**
 * getAllReducedMotionAlternatives.
 * @returns {Record<
  AnimationType,
  ReducedMotionAlternative
>}
 */
export function getAllReducedMotionAlternatives() {
  const types = ["slide", "scale", "fade", "expand", "rotate"];
  return Object.fromEntries(types.map((t) => [t, getReducedMotionAlternative(t)]));
}
/**
 * isValidReducedMotionStrategy.
 * @param {string} value
 * @returns {value is ReducedMotionStrategy}
 */
export function isValidReducedMotionStrategy(value) {
  return value === "crossfade" || value === "instant" || value === "reduce-duration" || value === "none";
}
