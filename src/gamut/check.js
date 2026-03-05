// @ts-check

/**
 * SigUI core gamut module for check.
 * @module
 */
import { oklchToOklab, oklabToLinearRgb } from "../color-space/oklch.js";
import { linearSrgbToXyz } from "../color-space/xyz.js";
import { xyzToLinearP3 } from "../color-space/p3.js";
const EPSILON = 0.000075;
/**
 * isInGamut.
 * @param {OklchColor} color
 * @param {Gamut} gamut
 * @returns {boolean}
 */
export function isInGamut(color, gamut = "srgb") {
  const lab = oklchToOklab(color);
  const linearSrgb = oklabToLinearRgb(lab);
  if (gamut === "srgb") {
    return linearSrgb.r >= -EPSILON && linearSrgb.r <= 1 + EPSILON && linearSrgb.g >= -EPSILON && linearSrgb.g <= 1 + EPSILON && linearSrgb.b >= -EPSILON && linearSrgb.b <= 1 + EPSILON;
  }
  const xyz = linearSrgbToXyz(linearSrgb);
  const p3 = xyzToLinearP3(xyz);
  return p3.r >= -EPSILON && p3.r <= 1 + EPSILON && p3.g >= -EPSILON && p3.g <= 1 + EPSILON && p3.b >= -EPSILON && p3.b <= 1 + EPSILON;
}
