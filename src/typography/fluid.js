// @ts-nocheck

/**
 * SigUI core typography module for fluid.
 * @module
 */
const DEFAULT_MIN_VW = 20;
const DEFAULT_MAX_VW = 90;
/**
 * fluidFontSize.
 * @param {number} minRem
 * @param {number} maxRem
 * @param {FluidTypographyOptions} options
 * @returns {string}
 */
export function fluidFontSize(minRem, maxRem, options) {
  const minVw = options?.minVw ?? DEFAULT_MIN_VW;
  const maxVw = options?.maxVw ?? DEFAULT_MAX_VW;
  const vpRange = maxVw - minVw;
  const sizeRange = maxRem - minRem;
  const vwCoefficient = sizeRange / vpRange * 100;
  const remBase = minRem - vwCoefficient * minVw / 100;
  const minStr = formatRem(minRem);
  const maxStr = formatRem(maxRem);
  const preferredStr = buildPreferred(remBase, vwCoefficient);
  return `clamp(${minStr}, ${preferredStr}, ${maxStr})`;
}
/**
 * deriveFluidMaxRatio.
 * @param {number} scaleRatio
 * @returns {number}
 */
export function deriveFluidMaxRatio(scaleRatio) {
  return Math.pow(scaleRatio, 1.2);
}
const SCALE_STEPS = [
  ["2xs", -3],
  ["xs", -2],
  ["sm", -1],
  ["base", 0],
  ["lg", 1],
  ["xl", 2],
  ["2xl", 3],
  ["3xl", 4],
  ["4xl", 5],
  ["5xl", 6],
  ["6xl", 7],
  ["7xl", 8],
  ["8xl", 9],
  ["9xl", 10]
];
/**
 * fluidTypeScale.
 * @param {FluidScaleOptions} options
 * @returns {Readonly<Record<string, string>>}
 */
export function fluidTypeScale(options) {
  const baseMin = options?.baseMin ?? 14 / 16;
  const baseMax = options?.baseMax ?? 1;
  const minRatio = options?.minRatio ?? 1.15;
  const maxRatio = options?.maxRatio ?? (options?.scaleRatio ? deriveFluidMaxRatio(options.scaleRatio) : 1.2);
  const minVw = options?.minVw ?? 20;
  const maxVw = options?.maxVw ?? 90;
  const result = {};
  for (const [name, step] of SCALE_STEPS) {
    const sizeMin = baseMin * Math.pow(minRatio, step);
    const sizeMax = baseMax * Math.pow(maxRatio, step);
    result[name] = fluidFontSize(sizeMin, sizeMax, { minVw, maxVw });
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
