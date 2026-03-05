// @ts-check

/**
 * SigUI core typography module for scale.
 * @module
 */
const DEFAULT_BASE = 16;
const DEFAULT_RATIO = 1.2;
const STEP_OFFSETS = {
  "2xs": -3,
  xs: -2,
  sm: -1,
  base: 0,
  lg: 1,
  xl: 2,
  "2xl": 3,
  "3xl": 4,
  "4xl": 5,
  "5xl": 6,
  "6xl": 7,
  "7xl": 8,
  "8xl": 9,
  "9xl": 10
};
function roundToPixelGrid(remValue) {
  return Math.round(remValue * 16) / 16;
}
/**
 * generateTypeScale.
 * @param {TypeScaleOptions} options
 * @returns {TypeScale}
 */
export function generateTypeScale(options) {
  const base = options?.base ?? DEFAULT_BASE;
  const ratio = options?.ratio ?? DEFAULT_RATIO;
  const unit = options?.unit ?? "rem";
  const steps = Object.keys(STEP_OFFSETS);
  const result = {};
  for (const name of steps) {
    const step = STEP_OFFSETS[name];
    const exactPx = base * Math.pow(ratio, step);
    if (unit === "px") {
      result[name] = Math.round(exactPx);
    } else {
      const exactRem = exactPx / 16;
      result[name] = roundToPixelGrid(exactRem);
    }
  }
  return result;
}
/**
 * remToPx.
 * @param {number} rem
 * @returns {number}
 */
export function remToPx(rem) {
  return rem * 16;
}
/**
 * pxToRem.
 * @param {number} px
 * @returns {number}
 */
export function pxToRem(px) {
  return px / 16;
}
