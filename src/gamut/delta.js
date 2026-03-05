// @ts-check

/**
 * SigUI core gamut module for delta.
 * @module
 */
import { oklchToOklab } from "../color-space/oklch.js";
/**
 * deltaEOK.
 * @param {OklchColor} a
 * @param {OklchColor} b
 * @returns {number}
 */
export function deltaEOK(a, b) {
  const labA = oklchToOklab(a);
  const labB = oklchToOklab(b);
  const dL = labA.L - labB.L;
  const da = labA.a - labB.a;
  const db = labA.b - labB.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}
