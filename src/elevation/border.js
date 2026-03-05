// @ts-check

/**
 * SigUI core elevation module for border.
 * @module
 */
const BORDER_SCALE = Object.freeze({
  none: 0,
  thin: 1,
  default: 1,
  medium: 2,
  thick: 4
});
/**
 * getBorderScale.
 * @returns {BorderScale}
 */
export function getBorderScale() {
  return { ...BORDER_SCALE };
}
const BORDER_RADIUS_SCALE = Object.freeze({
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999
});
/**
 * getBorderRadiusScale.
 * @param {Partial<Record<"sm" | "md" | "lg" | "xl" | "2xl", number>>} overrides
 * @returns {BorderRadiusScale}
 */
export function getBorderRadiusScale(overrides) {
  if (!overrides)
    return { ...BORDER_RADIUS_SCALE };
  return {
    none: BORDER_RADIUS_SCALE.none,
    sm: overrides.sm ?? BORDER_RADIUS_SCALE.sm,
    md: overrides.md ?? BORDER_RADIUS_SCALE.md,
    lg: overrides.lg ?? BORDER_RADIUS_SCALE.lg,
    xl: overrides.xl ?? BORDER_RADIUS_SCALE.xl,
    "2xl": overrides["2xl"] ?? BORDER_RADIUS_SCALE["2xl"],
    full: BORDER_RADIUS_SCALE.full
  };
}
/**
 * nestedRadius.
 * @param {number} outerRadius
 * @param {number} padding
 * @returns {number}
 */
export function nestedRadius(outerRadius, padding) {
  return Math.max(0, outerRadius - padding);
}
