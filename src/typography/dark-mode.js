// @ts-check

/**
 * SigUI core typography module for dark mode.
 * @module
 */
import { clamp } from "../utils.js";
const DEFAULT_WEIGHT_OFFSET = -100;
const DEFAULT_WEIGHT_FLOOR = 300;
const DEFAULT_LETTER_SPACING_OFFSET = "0.01em";
/**
 * darkModeAdjustments.
 * @param {number} _fontSizeRem
 * @param {number} fontWeight
 * @param {DarkModeOptions} options
 * @returns {DarkModeTypographyAdjustment}
 */
export function darkModeAdjustments(_fontSizeRem, fontWeight, options) {
  const weightOffset = options?.weightOffset ?? DEFAULT_WEIGHT_OFFSET;
  const weightFloor = options?.weightFloor ?? DEFAULT_WEIGHT_FLOOR;
  const letterSpacingOffset = options?.letterSpacingOffset ?? DEFAULT_LETTER_SPACING_OFFSET;
  const rawAdjusted = fontWeight + weightOffset;
  const adjustedWeight = clamp(rawAdjusted, weightFloor, 900);
  return {
    weightOffset,
    letterSpacingOffset,
    adjustedWeight
  };
}
/**
 * gradeOffset.
 * @param {number} offset
 * @returns {number}
 */
export function gradeOffset(offset = -25) {
  return offset;
}
