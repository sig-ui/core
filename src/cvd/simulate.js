// @ts-check

/**
 * SigUI core cvd module for simulate.
 * @module
 */
import { toOklch, oklchToOklab, oklabToLinearRgb, linearRgbToOklab, oklabToOklch } from "../color-space/oklch.js";
import { CVD_MATRICES } from "./matrices.js";
import { clamp } from "../utils.js";
/**
 * simulateCVD.
 * @param {OklchColor | string} color
 * @param {CvdType} type
 * @param {number} severity
 * @returns {OklchColor}
 */
export function simulateCVD(color, type, severity = 1) {
  const oklch = typeof color === "string" ? toOklch(color) : color;
  const sev = clamp(severity, 0, 1);
  if (sev === 0)
    return oklch;
  const matrix = getInterpolatedMatrix(type, sev);
  const lab = oklchToOklab(oklch);
  const linear = oklabToLinearRgb(lab);
  const r = matrix[0][0] * linear.r + matrix[0][1] * linear.g + matrix[0][2] * linear.b;
  const g = matrix[1][0] * linear.r + matrix[1][1] * linear.g + matrix[1][2] * linear.b;
  const b = matrix[2][0] * linear.r + matrix[2][1] * linear.g + matrix[2][2] * linear.b;
  const simLinear = {
    r: clamp(r, 0, 1),
    g: clamp(g, 0, 1),
    b: clamp(b, 0, 1)
  };
  const simLab = linearRgbToOklab(simLinear);
  const simLch = oklabToOklch(simLab);
  return { ...simLch, alpha: oklch.alpha };
}
function getInterpolatedMatrix(type, severity) {
  const matrices = CVD_MATRICES[type];
  const lower = Math.floor(severity * 10) / 10;
  const upper = Math.ceil(severity * 10) / 10;
  if (lower === upper || !matrices[upper]) {
    return matrices[lower] ?? matrices[1];
  }
  const t = (severity - lower) / (upper - lower);
  const mLow = matrices[lower];
  const mHigh = matrices[upper];
  return mLow.map((row, i) => row.map((val, j) => val + (mHigh[i][j] - val) * t));
}
