// @ts-check

/**
 * SigUI core spacing module for fluid.
 * @module
 */
import { generateSpacingScale } from "./scale.js";
import { TOUCH_TARGET_SIZES } from "./touch-targets.js";
const DEFAULT_MIN_VW = 20;
const DEFAULT_MAX_VW = 90;
const DEFAULT_BASE_UNIT = 4;
const DEFAULT_FLUID_EASING = "ease-out";
const EASE_OUT_POWER = 0.85;
const COMPACT_FACTOR = 0.75;
const SPACIOUS_FACTOR = 1.5;
const OPTICAL_AT_MIN_VW = 1.2;
const OPTICAL_AT_MAX_VW = 1;
/**
 * fluidSpacing.
 * @param {number} minPx
 * @param {number} maxPx
 * @param {FluidSpacingOptions} options
 * @returns {string}
 */
export function fluidSpacing(minPx, maxPx, options) {
  const minRem = minPx / 16;
  const maxRem = maxPx / 16;
  if (minPx === maxPx) {
    return minPx === 0 ? "0" : formatRem(minRem);
  }
  const minVw = options?.minVw ?? DEFAULT_MIN_VW;
  const maxVw = options?.maxVw ?? DEFAULT_MAX_VW;
  const fluidEasing = options?.fluidEasing ?? DEFAULT_FLUID_EASING;
  const vpRange = maxVw - minVw;
  const sizeRange = maxRem - minRem;
  const minStr = formatRem(minRem);
  const maxStr = formatRem(maxRem);
  const preferredStr = fluidEasing === "linear" ? buildLinearPreferred(minRem, maxRem, minVw, maxVw) : buildEaseOutPreferred(minRem, maxRem, minVw, maxVw);
  return `clamp(${minStr}, ${preferredStr}, ${maxStr})`;
}
/**
 * fluidSpacingScale.
 * @param {FluidSpacingOptions} options
 * @returns {ReadonlyMap<string, string>}
 */
export function fluidSpacingScale(options) {
  const baseUnit = options?.baseUnit ?? DEFAULT_BASE_UNIT;
  const includeExtended = options?.includeExtended ?? false;
  const minDensityFactor = options?.minDensityFactor ?? COMPACT_FACTOR;
  const maxDensityFactor = options?.maxDensityFactor ?? SPACIOUS_FACTOR;
  const opticalAtMinVw = options?.opticalAtMinVw ?? OPTICAL_AT_MIN_VW;
  const opticalAtMaxVw = options?.opticalAtMaxVw ?? OPTICAL_AT_MAX_VW;
  const touchFloorPx = options?.touchFloorPx ?? TOUCH_TARGET_SIZES.WCAG_MIN;
  const scale = generateSpacingScale({ baseUnit, includeExtended });
  const result = new Map;
  for (const [name, entry] of scale) {
    if (name === "0" || name === "px") {
      result.set(name, entry.px === 0 ? "0" : formatRem(entry.remValue));
      continue;
    }
    const densityMinPx = entry.px * minDensityFactor;
    const densityMaxPx = entry.px * maxDensityFactor;
    const opticalMinPx = densityMinPx * opticalAtMinVw;
    const opticalMaxPx = densityMaxPx * opticalAtMaxVw;
    const floorPx = entry.px >= touchFloorPx ? touchFloorPx : 0;
    const minPx = Math.max(opticalMinPx, floorPx);
    const maxPx = Math.max(opticalMaxPx, minPx);
    result.set(name, fluidSpacing(minPx, maxPx, options));
  }
  return result;
}
function formatRem(value) {
  const rounded = Math.round(value * 1e4) / 1e4;
  const str = rounded.toFixed(4).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return `${str}rem`;
}
function buildPreferred(remBase, vwCoefficient) {
  const remRounded = Math.round(remBase * 1e4) / 1e4;
  const vwRounded = Math.round(vwCoefficient * 100) / 100;
  const remStr = remRounded.toFixed(4).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  const vwStr = vwRounded.toFixed(2).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  if (vwRounded === 0) {
    return `${remStr}rem + 0vw`;
  }
  const vwSign = vwRounded >= 0 ? "+" : "-";
  const vwAbs = Math.abs(vwRounded).toFixed(2).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return `${remStr}rem ${vwSign} ${vwAbs}vw`;
}
function buildLinearPreferred(minRem, maxRem, minVw, maxVw) {
  const line = lineFromPoints(minVw, minRem, maxVw, maxRem);
  return buildPreferred(line.remBase, line.vwCoefficient);
}
function buildEaseOutPreferred(minRem, maxRem, minVw, maxVw) {
  const tMid = 0.5;
  const midVw = lerp(minVw, maxVw, tMid);
  const midRem = lerp(minRem, maxRem, Math.pow(tMid, EASE_OUT_POWER));
  const early = lineFromPoints(minVw, minRem, midVw, midRem);
  const late = lineFromPoints(midVw, midRem, maxVw, maxRem);
  const earlyStr = buildPreferred(early.remBase, early.vwCoefficient);
  const lateStr = buildPreferred(late.remBase, late.vwCoefficient);
  return `min(${earlyStr}, ${lateStr})`;
}
function lineFromPoints(x1, y1, x2, y2) {
  const slope = (y2 - y1) / (x2 - x1);
  return {
    remBase: y1 - slope * x1,
    vwCoefficient: slope * 100
  };
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
