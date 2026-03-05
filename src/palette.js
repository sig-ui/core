// @ts-check

/**
 * SigUI core palette module for palette.
 * @module
 */
import { toOklch, fromOklch } from "./color-space/oklch.js";
import { generateShadeRamp } from "./generation/shade.js";
import { ALL_STOPS, STANDARD_STOPS } from "./generation/targets.js";

/** @typedef {{ l: number, c: number, h: number, alpha: number }} OklchColor */
/** @typedef {"hex" | "oklch"} PaletteFormat */
/** @typedef {{ [stop: number]: OklchColor }} ShadeRamp */
/** @typedef {{ [stop: number]: string }} FormattedRamp */
/**
 * @typedef {object} GeneratePaletteOptions
 * @property {string | OklchColor} background
 * @property {"light" | "dark"} [mode]
 * @property {"srgb" | "p3"} [gamut]
 * @property {boolean} [hkCompensation]
 * @property {boolean} [extendedStops]
 * @property {boolean} [strictWCAG]
 * @property {boolean} [huntCompensation]
 * @property {number} [hueBlend]
 * @property {PaletteFormat} [format]
 */
/** @typedef {{ ramp: ShadeRamp, formatted: FormattedRamp }} PaletteResult */
/**
 * generatePalette.
 * @param {string | OklchColor} baseColor
 * @param {GeneratePaletteOptions} options
 * @returns {PaletteResult}
 */
export function generatePalette(baseColor, options) {
  const {
    background,
    mode = "light",
    gamut = "p3",
    hkCompensation = true,
    extendedStops = true,
    strictWCAG = false,
    huntCompensation = true,
    hueBlend = 0,
    format = "hex"
  } = options;
  const base = toOklch(baseColor);
  const bg = toOklch(background);
  const ramp = generateShadeRamp(base, {
    mode,
    background: bg,
    gamut,
    hkCompensation,
    huntCompensation,
    hueBlend: hueBlend > 0,
    extendedStops,
    strictWCAG
  });
  const stops = extendedStops ? ALL_STOPS : STANDARD_STOPS;
  const formatted = {};
  for (const stop of stops) {
    const shade = ramp[stop];
    if (shade) {
      formatted[stop] = fromOklch(shade, format);
    }
  }
  return { ramp, formatted };
}
