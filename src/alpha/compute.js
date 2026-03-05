// @ts-check

/**
 * SigUI core alpha module for compute.
 * @module
 */
import { oklchToOklab, oklabToLinearRgb } from "../color-space/oklch.js";
import { linearRgbToSrgb } from "../color-space/srgb.js";
import { clamp } from "../utils.js";
import { ALL_STOPS } from "../generation/targets.js";
function oklchToSrgb255(color) {
  const lab = oklchToOklab(color);
  const linear = oklabToLinearRgb(lab);
  const srgb = linearRgbToSrgb(linear);
  return { r: srgb.r, g: srgb.g, b: srgb.b };
}
/**
 * computeAlphaEquivalent.
 * @param {OklchColor} target
 * @param {OklchColor} background
 * @param {AlphaStop} alpha
 * @returns {AlphaEquivalent}
 */
export function computeAlphaEquivalent(target, background, alpha) {
  const t = oklchToSrgb255(target);
  const b = oklchToSrgb255(background);
  const rawR = (t.r - b.r * (1 - alpha)) / alpha;
  const rawG = (t.g - b.g * (1 - alpha)) / alpha;
  const rawB = (t.b - b.b * (1 - alpha)) / alpha;
  const r = Math.round(clamp(rawR, 0, 255));
  const g = Math.round(clamp(rawG, 0, 255));
  const bl = Math.round(clamp(rawB, 0, 255));
  const exact = Math.abs(rawR - r) < 0.6 && Math.abs(rawG - g) < 0.6 && Math.abs(rawB - bl) < 0.6 && rawR >= -0.5 && rawR <= 255.5 && rawG >= -0.5 && rawG <= 255.5 && rawB >= -0.5 && rawB <= 255.5;
  const rgba = { r, g, b: bl, a: alpha };
  const roundedAlpha = Math.round(alpha * 1000) / 1000;
  const css = `rgba(${r}, ${g}, ${bl}, ${roundedAlpha})`;
  return { alpha, rgba, css, exact };
}
/**
 * computeAlphaShadeRamp.
 * @param {OklchColor} shade
 * @param {OklchColor} background
 * @returns {AlphaShadeRamp}
 */
export function computeAlphaShadeRamp(shade, background) {
  const stops = [0.05, 0.1, 0.2, 0.3, 0.5, 0.75];
  const result = {};
  for (const alpha of stops) {
    result[alpha] = computeAlphaEquivalent(shade, background, alpha);
  }
  return result;
}
/**
 * generateAlphaRamp.
 * @param {ShadeRamp} ramp
 * @param {OklchColor} background
 * @returns {AlphaRamp}
 */
export function generateAlphaRamp(ramp, background) {
  const result = {};
  for (const stop of ALL_STOPS) {
    result[stop] = computeAlphaShadeRamp(ramp[stop], background);
  }
  return result;
}
