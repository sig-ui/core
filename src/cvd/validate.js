// @ts-check

/**
 * SigUI core cvd module for validate.
 * @module
 */
import { toOklch } from "../color-space/oklch.js";
import { simulateCVD } from "./simulate.js";
import { deltaEOK } from "../gamut/delta.js";
function resolve(color) {
  return typeof color === "string" ? toOklch(color) : color;
}
/**
 * validateCvdPair.
 * @param {OklchColor | string} color1
 * @param {OklchColor | string} color2
 * @param {CvdType[]} types
 * @param {number} minDistance
 * @returns {CvdPairResult}
 */
export function validateCvdPair(color1, color2, types = ["protan", "deutan"], minDistance = 0.05) {
  const c1 = resolve(color1);
  const c2 = resolve(color2);
  let minDelta = 1 / 0;
  let worstType = types[0];
  for (const type of types) {
    const sim1 = simulateCVD(c1, type, 1);
    const sim2 = simulateCVD(c2, type, 1);
    const d = deltaEOK(sim1, sim2);
    if (d < minDelta) {
      minDelta = d;
      worstType = type;
    }
  }
  return { pass: minDelta >= minDistance, minDelta, worstType };
}
/**
 * validateCategoricalPalette.
 * @param {(OklchColor | string)[]} colors
 * @param {{ types?: CvdType[]; minDistance?: number }} options
 * @returns {CvdPaletteResult}
 */
export function validateCategoricalPalette(colors, options = {}) {
  const { types = ["protan", "deutan"], minDistance = 0.05 } = options;
  const resolved = colors.map(resolve);
  const failingPairs = [];
  for (let i = 0;i < resolved.length; i++) {
    for (let j = i + 1;j < resolved.length; j++) {
      for (const type of types) {
        const sim1 = simulateCVD(resolved[i], type, 1);
        const sim2 = simulateCVD(resolved[j], type, 1);
        const d = deltaEOK(sim1, sim2);
        if (d < minDistance) {
          failingPairs.push({ i, j, delta: d, type });
        }
      }
    }
  }
  return { pass: failingPairs.length === 0, failingPairs };
}
