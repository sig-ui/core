// @ts-check

/**
 * SigUI core spacing module for optical spacing.
 * @module
 */
const DEFAULT_MIN_VW = 320;
const DEFAULT_MAX_VW = 1440;
const MULTIPLIER_AT_MIN = 1.2;
const MULTIPLIER_AT_MAX = 1;
function normalize(value, min, max) {
  if (value <= min)
    return 0;
  if (value >= max)
    return 1;
  return (value - min) / (max - min);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
/**
 * opticalSpacingMultiplier.
 * @param {number} viewportWidthPx
 * @param {{ minVw?: number; maxVw?: number }} options
 * @returns {number}
 */
export function opticalSpacingMultiplier(viewportWidthPx, options) {
  const minVw = options?.minVw ?? DEFAULT_MIN_VW;
  const maxVw = options?.maxVw ?? DEFAULT_MAX_VW;
  const t = normalize(viewportWidthPx, minVw, maxVw);
  return lerp(MULTIPLIER_AT_MIN, MULTIPLIER_AT_MAX, t);
}
/**
 * opticalSpacingFluid.
 * @param {{ minVw?: number; maxVw?: number }} options
 * @returns {string}
 */
export function opticalSpacingFluid(options) {
  const minVw = options?.minVw ?? DEFAULT_MIN_VW;
  const maxVw = options?.maxVw ?? DEFAULT_MAX_VW;
  const minVwRem = minVw / 16;
  const maxVwRem = maxVw / 16;
  const range = maxVwRem - minVwRem;
  const vwCoefficient = -0.2 / range * 100;
  const remBase = MULTIPLIER_AT_MIN - vwCoefficient * minVwRem / 100;
  const remStr = Math.round(remBase * 1e4) / 1e4;
  const vwStr = Math.round(Math.abs(vwCoefficient) * 100) / 100;
  return `clamp(${MULTIPLIER_AT_MAX}, ${remStr} - ${vwStr}vw, ${MULTIPLIER_AT_MIN})`;
}
