// @ts-check

/**
 * SigUI core typography module for x height.
 * @module
 */
export const FONT_X_HEIGHT_RATIOS = {
  Inter: 0.54,
  Roboto: 0.53,
  "Open Sans": 0.53,
  Lato: 0.52,
  Montserrat: 0.48,
  "Source Sans Pro": 0.52,
  "Noto Sans": 0.54,
  Poppins: 0.52,
  Raleway: 0.47,
  "PT Sans": 0.5,
  Ubuntu: 0.52,
  "Fira Sans": 0.53,
  "Work Sans": 0.52,
  "DM Sans": 0.53,
  "Plus Jakarta Sans": 0.52,
  "system-ui": 0.52
};
const DEFAULT_TARGET_RATIO = 0.52;
const DEFAULT_THRESHOLD = 0.5;
/**
 * getFontSizeAdjust.
 * @param {number} targetXHeightRatio
 * @returns {string}
 */
export function getFontSizeAdjust(targetXHeightRatio) {
  const ratio = targetXHeightRatio ?? DEFAULT_TARGET_RATIO;
  return ratio.toString();
}
/**
 * needsXHeightNormalization.
 * @param {string} fontName
 * @param {number} threshold
 * @returns {boolean}
 */
export function needsXHeightNormalization(fontName, threshold) {
  const minRatio = threshold ?? DEFAULT_THRESHOLD;
  const fontRatio = FONT_X_HEIGHT_RATIOS[fontName];
  if (fontRatio === undefined)
    return true;
  return fontRatio < minRatio;
}
