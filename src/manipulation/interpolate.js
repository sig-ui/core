// @ts-check

/**
 * SigUI core manipulation module for interpolate.
 * @module
 */
import { toOklch } from "../color-space/oklch.js";
import { oklchToOklab, oklabToOklch } from "../color-space/oklch.js";
import { lerp, lerpHue } from "../utils.js";

/** @typedef {{ l: number, c: number, h: number, alpha: number }} OklchColor */
/** @typedef {string | OklchColor} ColorInput */
/** @typedef {{ space?: "oklab" | "oklch" }} InterpolationOptions */

/**
 * Normalize string/OKLCH input to OKLCH.
 * @param {ColorInput} color
 * @returns {OklchColor}
 */
function resolve(color) {
  return typeof color === "string" ? toOklch(color) : color;
}
/**
 * interpolateColor.
 * @param {ColorInput} c1
 * @param {ColorInput} c2
 * @param {number} t
 * @param {InterpolationOptions} [options]
 * @returns {OklchColor}
 */
export function interpolateColor(c1, c2, t, options = {}) {
  const { space = "oklab" } = options;
  const a = resolve(c1);
  const b = resolve(c2);
  if (space === "oklch") {
    return {
      l: lerp(a.l, b.l, t),
      c: lerp(a.c, b.c, t),
      h: lerpHue(a.h, b.h, t),
      alpha: lerp(a.alpha, b.alpha, t)
    };
  }
  const labA = oklchToOklab(a);
  const labB = oklchToOklab(b);
  const interpolated = {
    L: lerp(labA.L, labB.L, t),
    a: lerp(labA.a, labB.a, t),
    b: lerp(labA.b, labB.b, t),
    alpha: lerp(a.alpha, b.alpha, t)
  };
  return oklabToOklch(interpolated);
}
/**
 * gradientFill.
 * @param {ColorInput} c1
 * @param {ColorInput} c2
 * @param {number} steps
 * @param {InterpolationOptions} [options]
 * @returns {OklchColor[]}
 */
export function gradientFill(c1, c2, steps, options = {}) {
  const result = [];
  for (let i = 0;i < steps; i++) {
    const t = steps === 1 ? 0.5 : i / (steps - 1);
    result.push(interpolateColor(c1, c2, t, options));
  }
  return result;
}
/**
 * multiGradient.
 * @param {ColorInput[]} colors
 * @param {number} steps
 * @param {InterpolationOptions} [options]
 * @returns {OklchColor[]}
 */
export function multiGradient(colors, steps, options = {}) {
  if (colors.length < 2) {
    return colors.map((c) => resolve(c));
  }
  const segments = colors.length - 1;
  const stepsPerSegment = Math.max(2, Math.ceil(steps / segments));
  const result = [];
  for (let i = 0;i < segments; i++) {
    const segSteps = i === segments - 1 ? steps - result.length : stepsPerSegment;
    const segment = gradientFill(colors[i], colors[i + 1], segSteps, options);
    if (i > 0 && segment.length > 0)
      segment.shift();
    result.push(...segment);
  }
  return result;
}
