// @ts-check

/**
 * SigUI core spacing module for density.
 * @module
 */
import { clamp } from "../utils.js";
import { TOUCH_TARGET_SIZES } from "./touch-targets.js";
export const DENSITY_MULTIPLIERS = {
  compact: 0.75,
  comfortable: 1,
  spacious: 1.5
};
export const DENSITY_CSS_VALUES = {
  compact: "0.75",
  comfortable: "1",
  spacious: "1.5"
};
export const DENSITY_EXEMPT_COMPONENTS = [
  "alert",
  "help-panel",
  "form-validation",
  "legal-notice",
  "skip-link",
  "focus-ring"
];
/**
 * getDensityMultiplier.
 * @param {SpacingDensity} density
 * @returns {number}
 */
export function getDensityMultiplier(density) {
  return DENSITY_MULTIPLIERS[density];
}
/**
 * applyDensity.
 * @param {number} spacingValue
 * @param {SpacingDensity} density
 * @returns {number}
 */
export function applyDensity(spacingValue, density) {
  const multiplier = getDensityMultiplier(density);
  const scaled = spacingValue * multiplier;
  return Math.max(0, Math.round(scaled * 100) / 100);
}
/**
 * applyDensityClamped.
 * @param {number} spacingValue
 * @param {SpacingDensity} density
 * @param {boolean} isTouchTarget
 * @returns {number}
 */
export function applyDensityClamped(spacingValue, density, isTouchTarget = false) {
  const scaled = applyDensity(spacingValue, density);
  if (isTouchTarget) {
    return Math.max(scaled, TOUCH_TARGET_SIZES.WCAG_MIN);
  }
  return scaled;
}
/**
 * composeSpacingScales.
 * @param {number} spacingValue
 * @param {number} contextScale
 * @param {SpacingDensity} density
 * @returns {number}
 */
export function composeSpacingScales(spacingValue, contextScale, density) {
  const densityMultiplier = getDensityMultiplier(density);
  const composed = spacingValue * contextScale * densityMultiplier;
  return Math.max(0, Math.round(composed * 100) / 100);
}
export const CONTEXT_SCALE_FACTORS = {
  xs: 0.69,
  sm: 0.81,
  base: 1,
  lg: 1.19,
  xl: 1.44
};
/**
 * getContextScaleFactor.
 * @param {string} textSize
 * @returns {number}
 */
export function getContextScaleFactor(textSize) {
  return CONTEXT_SCALE_FACTORS[textSize] ?? 1;
}
