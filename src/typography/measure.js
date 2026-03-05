// @ts-check

/**
 * SigUI core typography module for measure.
 * @module
 */
const MEASURE_NARROW = 45;
const MEASURE_BASE = 66;
const MEASURE_WIDE = 75;
/**
 * computeMeasure.
 * @param {number} _fontSizeRem
 * @returns {MeasureResult}
 */
export function computeMeasure(_fontSizeRem) {
  return {
    min: MEASURE_NARROW,
    ideal: MEASURE_BASE,
    max: MEASURE_WIDE
  };
}
/**
 * measureTokens.
 * @returns {Readonly<{
  narrow: string;
  base: string;
  wide: string;
}>}
 */
export function measureTokens() {
  return {
    narrow: `${MEASURE_NARROW}ch`,
    base: `${MEASURE_BASE}ch`,
    wide: `${MEASURE_WIDE}ch`
  };
}
