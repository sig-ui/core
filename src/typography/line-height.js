// @ts-check

/**
 * SigUI core typography module for line height.
 * @module
 */
const DEFAULT_LEADING_BASE = 1.2;
const DEFAULT_LEADING_SCALE = 5.6;
/**
 * computeLineHeight.
 * @param {number} fontSizeRem
 * @param {LineHeightOptions} options
 * @returns {LineHeightResult}
 */
export function computeLineHeight(fontSizeRem, options) {
  const leadingBase = options?.leadingBase ?? DEFAULT_LEADING_BASE;
  const leadingScale = options?.leadingScale ?? DEFAULT_LEADING_SCALE;
  const fontSizePx = fontSizeRem * 16;
  const ratio = leadingBase + leadingScale / fontSizePx;
  const rounded = Math.round(ratio * 100) / 100;
  return {
    ratio: rounded,
    computed: rounded.toFixed(2)
  };
}
/**
 * longMeasureOffset.
 * @param {number} containerChWidth
 * @param {number} measureBase
 * @returns {number}
 */
export function longMeasureOffset(containerChWidth, measureBase = 66) {
  return containerChWidth > measureBase ? 0.1 : 0;
}
