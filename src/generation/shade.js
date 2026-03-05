// @ts-check

/**
 * SigUI core generation module for shade.
 * @module
 */
import { apcaContrast } from "../contrast/apca.js";
import { isInGamut } from "../gamut/check.js";
import { clampToGamut } from "../gamut/clamp.js";
import { bridgePcaContrast } from "../contrast/bridge-pca.js";
import { hkOffset } from "./hk.js";
import { applyHuntCompensation } from "./hunt.js";
import { blendHue } from "./hue-blend.js";
import { LC_TARGETS, STANDARD_STOPS, ALL_STOPS } from "./targets.js";
/**
 * generateShadeRamp.
 * @param {OklchColor} baseColor
 * @param {ShadeGenerationOptions} options
 * @returns {ShadeRamp}
 */
export function generateShadeRamp(baseColor, options) {
  const {
    mode,
    background,
    gamut = "p3",
    hkCompensation = true,
    huntCompensation = true,
    hueBlend: hueBlendEnabled = false,
    extendedStops = true,
    strictWCAG = false
  } = options;
  const hue = baseColor.h;
  let chroma = baseColor.c;
  if (mode === "dark" && huntCompensation) {
    chroma = applyHuntCompensation(chroma, background.l);
  }
  const stops = extendedStops ? ALL_STOPS : STANDARD_STOPS;
  const ramp = {};
  for (const shade of stops) {
    const targetLc = LC_TARGETS[mode][shade];
    let shadeColor = findShadeForTarget(hue, chroma, targetLc, background, mode, { hkCompensation, gamut });
    if (hueBlendEnabled && background.c > 0.001) {
      const blendedH = blendHue(shadeColor.h, background.h, shade);
      shadeColor = { ...shadeColor, h: blendedH };
    }
    if (strictWCAG) {
      shadeColor = ensureWcagCompliance(shadeColor, background, mode);
    }
    ramp[shade] = shadeColor;
  }
  return ramp;
}
/**
 * findShadeForTarget.
 * @param {number} hue
 * @param {number} chroma
 * @param {number} targetLc
 * @param {OklchColor} background
 * @param {ColorMode} mode
 * @param {{ hkCompensation?: boolean; gamut?: Gamut }} options
 * @returns {OklchColor}
 */
export function findShadeForTarget(hue, chroma, targetLc, background, mode, options = {}) {
  const { hkCompensation = true, gamut = "p3" } = options;
  const offset = hkCompensation ? hkOffset(chroma, hue) : 0;
  let lLow = 0;
  let lHigh = 1;
  const epsilon = 0.0001;
  let bestCandidate = { l: 0.5, c: chroma, h: hue, alpha: 1 };
  for (let i = 0;i < 64; i++) {
    if (lHigh - lLow <= epsilon)
      break;
    const lMid = (lLow + lHigh) / 2;
    const lCompensated = Math.max(0, Math.min(1, lMid - offset));
    let candidate = { l: lCompensated, c: chroma, h: hue, alpha: 1 };
    if (!isInGamut(candidate, gamut)) {
      candidate = clampToGamut(candidate, gamut);
    }
    let computedLc;
    if (mode === "light") {
      computedLc = Math.abs(apcaContrast(candidate, background));
    } else {
      computedLc = Math.abs(apcaContrast(candidate, background));
    }
    bestCandidate = candidate;
    if (Math.abs(computedLc - targetLc) < 1)
      break;
    if (mode === "light") {
      if (computedLc < targetLc) {
        lHigh = lMid;
      } else {
        lLow = lMid;
      }
    } else {
      if (computedLc < targetLc) {
        lLow = lMid;
      } else {
        lHigh = lMid;
      }
    }
  }
  return bestCandidate;
}
function ensureWcagCompliance(shade, background, mode) {
  const ratio = bridgePcaContrast(shade, background);
  if (ratio >= 4.5)
    return shade;
  let l = shade.l;
  const step = mode === "light" ? -0.005 : 0.005;
  for (let i = 0;i < 100; i++) {
    l += step;
    if (l < 0 || l > 1)
      break;
    const candidate = { ...shade, l };
    const newRatio = bridgePcaContrast(candidate, background);
    if (newRatio >= 4.5)
      return candidate;
  }
  return shade;
}
