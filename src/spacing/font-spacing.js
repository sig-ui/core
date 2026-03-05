// @ts-check

/**
 * SigUI core spacing module for font spacing.
 * @module
 */
function snap(value, baseUnit) {
  const snapped = Math.round(value / baseUnit) * baseUnit;
  return Math.max(snapped, baseUnit);
}
/**
 * deriveFontSpacingSubset.
 * @param {TypeScaleStep} step
 * @param {number} fontSizePx
 * @param {number} lineHeightRatio
 * @param {FontSpacingOptions} options
 * @returns {FontSpacingSubset}
 */
export function deriveFontSpacingSubset(step, fontSizePx, lineHeightRatio, options) {
  const baseUnit = options?.baseUnit ?? 4;
  const touchMinimum = options?.touchMinimum ?? 44;
  const gap = snap(fontSizePx * 0.5, baseUnit);
  const padX = snap(fontSizePx * 1, baseUnit);
  const padY = snap(fontSizePx * 0.75, baseUnit);
  const gapStack = snap(fontSizePx * lineHeightRatio * 0.75, baseUnit);
  const minHeight = Math.max(snap(touchMinimum, baseUnit), snap(fontSizePx * lineHeightRatio + 2 * padY, baseUnit));
  return { step, fontSizePx, gap, padX, padY, minHeight, gapStack };
}
/**
 * generateFontSpacingSubsets.
 * @param {ReadonlyArray<readonly [TypeScaleStep, number, number]>} typeScaleEntries
 * @param {FontSpacingOptions} options
 * @returns {ReadonlyMap<TypeScaleStep, FontSpacingSubset>}
 */
export function generateFontSpacingSubsets(typeScaleEntries, options) {
  const map = new Map;
  for (const [step, fontSizePx, lineHeightRatio] of typeScaleEntries) {
    map.set(step, deriveFontSpacingSubset(step, fontSizePx, lineHeightRatio, options));
  }
  return map;
}
