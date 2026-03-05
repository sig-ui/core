// @ts-check

/**
 * SigUI core spacing module for component height.
 * @module
 */
export const VERTICAL_PADDING_PRESETS = {
  compact: 4,
  comfortable: 8,
  spacious: 12
};
const DEFAULT_TOUCH_MINIMUM = 44;
const DEFAULT_GRID_UNIT = 4;
const DEFAULT_VERTICAL_PADDING = 8;
function roundToGrid(value, gridUnit) {
  return Math.round(value / gridUnit) * gridUnit;
}
/**
 * computeComponentHeight.
 * @param {ComponentHeightOptions} options
 * @returns {ComponentHeightResult}
 */
export function computeComponentHeight(options) {
  const {
    bodyLineHeightPx,
    verticalPadding = DEFAULT_VERTICAL_PADDING,
    gridUnit = DEFAULT_GRID_UNIT,
    touchMinimum = DEFAULT_TOUCH_MINIMUM
  } = options;
  const raw = bodyLineHeightPx + 2 * verticalPadding;
  const snapped = roundToGrid(raw, gridUnit);
  const clampedByTouch = snapped < touchMinimum;
  const height = Math.max(touchMinimum, snapped);
  return { height, clampedByTouch };
}
