// @ts-check

/**
 * SigUI core spacing module for content spacing.
 * @module
 */
const DEFAULT_GRID_UNIT = 4;
function roundToGrid(value, gridUnit) {
  return Math.round(value / gridUnit) * gridUnit;
}
/**
 * computeContentSpacing.
 * @param {number} bodyFontSizePx
 * @param {number} bodyLineHeightRatio
 * @param {{ gridUnit?: number }} options
 * @returns {ContentSpacing}
 */
export function computeContentSpacing(bodyFontSizePx, bodyLineHeightRatio, options) {
  const gridUnit = options?.gridUnit ?? DEFAULT_GRID_UNIT;
  const bodyLineHeightPx = bodyFontSizePx * bodyLineHeightRatio;
  return {
    paragraphSpacing: roundToGrid(bodyLineHeightPx * 0.75, gridUnit),
    headingTopMargin: roundToGrid(bodyLineHeightPx * 1.5, gridUnit),
    headingBottomMargin: roundToGrid(bodyLineHeightPx * 0.5, gridUnit)
  };
}
