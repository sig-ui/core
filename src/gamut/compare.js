// @ts-check

/**
 * SigUI core gamut module for compare.
 * @module
 */
import { isInGamut } from "./check.js";
import { clampToGamut } from "./clamp.js";
import { deltaEOK } from "./delta.js";
import { ALL_STOPS } from "../generation/targets.js";
/**
 * compareRampGamut.
 * @param {ShadeRamp} ramp
 * @returns {RampGamutComparison}
 */
export function compareRampGamut(ramp) {
  const stops = [];
  let outOfSrgbCount = 0;
  let maxDeltaE = 0;
  for (const stop of ALL_STOPS) {
    const color = ramp[stop];
    if (!color)
      continue;
    const inSrgb = isInGamut(color, "srgb");
    const srgbClamped = inSrgb ? color : clampToGamut(color, "srgb");
    const dE = inSrgb ? 0 : deltaEOK(color, srgbClamped);
    if (!inSrgb)
      outOfSrgbCount++;
    if (dE > maxDeltaE)
      maxDeltaE = dE;
    stops.push({ stop, p3: color, srgbClamped, deltaE: dE, inSrgb });
  }
  return { stops, outOfSrgbCount, maxDeltaE };
}
/**
 * comparePaletteGamut.
 * @param {Record<string, ShadeRamp>} ramps
 * @returns {PaletteGamutComparison}
 */
export function comparePaletteGamut(ramps) {
  const result = {};
  let totalOutOfSrgb = 0;
  let totalStops = 0;
  for (const [name, ramp] of Object.entries(ramps)) {
    const comparison = compareRampGamut(ramp);
    result[name] = comparison;
    totalOutOfSrgb += comparison.outOfSrgbCount;
    totalStops += comparison.stops.length;
  }
  return { ramps: result, totalOutOfSrgb, totalStops };
}
