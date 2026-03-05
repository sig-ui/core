// @ts-nocheck

/**
 * SigUI core typography module for vertical rhythm.
 * @module
 */
const DEFAULT_BASE_UNIT = 4;
/**
 * computeVerticalRhythm.
 * @param {{ baseUnit?: number }} options
 * @returns {VerticalRhythmResult}
 */
export function computeVerticalRhythm(options) {
  const baseUnit = options?.baseUnit ?? DEFAULT_BASE_UNIT;
  const proseTokens = {
    proseGapXs: baseUnit * 1,
    proseGapSm: baseUnit * 2,
    proseGapBase: baseUnit * 4,
    proseGapLg: baseUnit * 6,
    proseGapXl: baseUnit * 8,
    proseGap2xl: baseUnit * 12
  };
  const headingSpacing = {
    marginTop: 2 * proseTokens.proseGapLg,
    marginBottom: 1 * proseTokens.proseGapBase
  };
  return {
    baseUnit,
    proseTokens,
    headingSpacing
  };
}
/**
 * computeHeadingSpacing.
 * @param {number} bodyLineHeightPx
 * @returns {HeadingSpacing}
 */
export function computeHeadingSpacing(bodyLineHeightPx) {
  const rhythm = computeVerticalRhythm();
  return rhythm.headingSpacing;
}
