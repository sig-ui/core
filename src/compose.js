// @ts-nocheck

/**
 * SigUI core compose module for compose.
 * @module
 */
import { generateFullPalette } from "./harmony/theme.js";
import { generateAlphaRamp } from "./alpha/compute.js";
import { generateBlackAlphaScale, generateWhiteAlphaScale } from "./alpha/overlay.js";
import { toOklch } from "./color-space/oklch.js";

/** @typedef {"analogous" | "complementary" | "triadic" | "tetradic" | "split-complementary"} HarmonyMode */
/** @typedef {{ opacity: number, css: string }} AlphaScaleEntry */
/** @typedef {Record<number, AlphaScaleEntry>} OverlayScale */
/** @typedef {Record<string, Record<number, string>>} AlphaRampMap */
/** @typedef {Record<string, { ramp: Record<number, { l: number, c: number, h: number, alpha: number }>, formatted: Record<number, string> }>} PaletteMap */
/**
 * @typedef {object} ComposePaletteOptions
 * @property {boolean} [alphaVariants]
 * @property {HarmonyMode} [harmony]
 * @property {"light" | "dark"} [mode]
 * @property {"srgb" | "p3"} [gamut]
 * @property {Record<string, string>} [overrides]
 * @property {number} [tintStrength]
 * @property {string} [background]
 */
/**
 * @typedef {object} ComposedPalette
 * @property {PaletteMap} palettes
 * @property {AlphaRampMap} [alphaRamps]
 * @property {OverlayScale} blackAlpha
 * @property {OverlayScale} whiteAlpha
 * @property {{ primary: number, hues: number[], mode: HarmonyMode }} harmony
 * @property {string} background
 * @property {"light" | "dark"} mode
 */
/**
 * composePalette.
 * @param {string} primary
 * @param {ComposePaletteOptions} [options]
 * @returns {ComposedPalette}
 */
export function composePalette(primary, options = {}) {
  const { alphaVariants = false, ...themeOptions } = options;
  const theme = generateFullPalette(primary, themeOptions);
  const palettes = {};
  for (const [name, result] of Object.entries(theme.palettes)) {
    palettes[name] = { ramp: result.ramp, formatted: result.formatted };
  }
  const blackAlpha = generateBlackAlphaScale();
  const whiteAlpha = generateWhiteAlphaScale();
  let alphaRamps;
  if (alphaVariants) {
    const bgOklch = toOklch(theme.background);
    alphaRamps = {};
    for (const [name, result] of Object.entries(theme.palettes)) {
      alphaRamps[name] = generateAlphaRamp(result.ramp, bgOklch);
    }
  }
  return {
    palettes,
    alphaRamps,
    blackAlpha,
    whiteAlpha,
    harmony: {
      primary: theme.harmony.primary,
      hues: [...theme.harmony.hues],
      mode: themeOptions.harmony ?? "triadic"
    },
    background: theme.background,
    mode: theme.mode
  };
}
