// @ts-check

/**
 * SigUI core color module for color.
 * @module
 */
export { toOklch, fromOklch } from "./color-space/oklch.js";
export { parseHex, toHex } from "./color-space/srgb.js";
export {
  lighten,
  darken,
  saturate,
  desaturate,
  shiftHue
} from "./manipulation/adjust.js";
export { isInGamut } from "./gamut/check.js";
export { clampToGamut } from "./gamut/clamp.js";
export { deltaEOK } from "./gamut/delta.js";
export { compareRampGamut, comparePaletteGamut } from "./gamut/compare.js";
