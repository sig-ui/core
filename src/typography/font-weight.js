// @ts-check

/**
 * SigUI core typography module for font weight.
 * @module
 */
const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
};
/**
 * getFontWeights.
 * @returns {FontWeightMap}
 */
export function getFontWeights() {
  return FONT_WEIGHTS;
}
/**
 * suggestedWeight.
 * @param {number} fontSizeRem
 * @returns {keyof FontWeightMap}
 */
export function suggestedWeight(fontSizeRem) {
  const px = fontSizeRem * 16;
  if (px >= 57)
    return "extrabold";
  if (px >= 40)
    return "bold";
  if (px >= 28)
    return "semibold";
  if (px >= 20)
    return "medium";
  if (px >= 16)
    return "normal";
  return "medium";
}
