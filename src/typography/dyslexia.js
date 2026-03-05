// @ts-check

/**
 * SigUI core typography module for dyslexia.
 * @module
 */
/**
 * getDyslexiaAdjustments.
 * @returns {DyslexiaAdjustments}
 */
export function getDyslexiaAdjustments() {
  return {
    letterSpacingOffset: "+0.05em",
    wordSpacingOffset: "+0.1em",
    lineHeightOffset: 0.2,
    paragraphSpacing: "2em"
  };
}
/**
 * applyDyslexiaLineHeight.
 * @param {number} baseLineHeight
 * @returns {number}
 */
export function applyDyslexiaLineHeight(baseLineHeight) {
  return baseLineHeight + 0.2;
}
