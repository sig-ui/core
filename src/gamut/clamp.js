// @ts-check

/**
 * SigUI core gamut module for clamp.
 * @module
 */
import { oklchToOklab, oklabToLinearRgb, linearRgbToOklab, oklabToOklch } from "../color-space/oklch.js";
import { linearSrgbToXyz } from "../color-space/xyz.js";
import { xyzToLinearP3, linearP3ToXyz } from "../color-space/p3.js";
import { xyzToLinearSrgb } from "../color-space/xyz.js";
import { isInGamut } from "./check.js";
import { deltaEOK } from "./delta.js";
import { clamp } from "../utils.js";
/**
 * clipToGamut.
 * @param {OklchColor} color
 * @param {Gamut} gamut
 * @returns {OklchColor}
 */
export function clipToGamut(color, gamut = "srgb") {
  const lab = oklchToOklab(color);
  const linearSrgb = oklabToLinearRgb(lab);
  if (gamut === "srgb") {
    const clamped = {
      r: clamp(linearSrgb.r, 0, 1),
      g: clamp(linearSrgb.g, 0, 1),
      b: clamp(linearSrgb.b, 0, 1)
    };
    const clampedLab = linearRgbToOklab(clamped);
    const clampedLch = oklabToOklch(clampedLab);
    const h = clampedLch.c < 0.0001 ? color.h : clampedLch.h;
    return { l: clampedLch.l, c: clampedLch.c, h, alpha: color.alpha };
  }
  const xyz = linearSrgbToXyz(linearSrgb);
  const p3 = xyzToLinearP3(xyz);
  const clampedP3 = {
    r: clamp(p3.r, 0, 1),
    g: clamp(p3.g, 0, 1),
    b: clamp(p3.b, 0, 1)
  };
  const backXyz = linearP3ToXyz(clampedP3);
  const backSrgb = xyzToLinearSrgb(backXyz);
  const clampedLab = linearRgbToOklab(backSrgb);
  const clampedLch = oklabToOklch(clampedLab);
  const h = clampedLch.c < 0.0001 ? color.h : clampedLch.h;
  return { l: clampedLch.l, c: clampedLch.c, h, alpha: color.alpha };
}
/**
 * clampToGamut.
 * @param {OklchColor} color
 * @param {Gamut} gamut
 * @returns {OklchColor}
 */
export function clampToGamut(color, gamut = "srgb") {
  if (isInGamut(color, gamut))
    return color;
  if (color.l <= 0)
    return { l: 0, c: 0, h: color.h, alpha: color.alpha };
  if (color.l >= 1)
    return { l: 1, c: 0, h: color.h, alpha: color.alpha };
  let cLow = 0;
  let cHigh = color.c;
  const epsilon = 0.001;
  const JND = 0.02;
  while (cHigh - cLow > epsilon) {
    const cMid = (cLow + cHigh) / 2;
    const candidate = { l: color.l, c: cMid, h: color.h, alpha: color.alpha };
    if (isInGamut(candidate, gamut)) {
      cLow = cMid;
    } else {
      const clipped = clipToGamut(candidate, gamut);
      const dE = deltaEOK(candidate, clipped);
      if (dE < JND) {
        return clipped;
      }
      cHigh = cMid;
    }
  }
  return clipToGamut({ l: color.l, c: cLow, h: color.h, alpha: color.alpha }, gamut);
}
