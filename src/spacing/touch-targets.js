// @ts-check

/**
 * SigUI core spacing module for touch targets.
 * @module
 */
import { clamp } from "../utils.js";
export const TOUCH_TARGET_SIZES = {
  WCAG_MIN: 44,
  COMFORTABLE: 48,
  COMPACT: 36,
  POINTER_MIN: 24,
  POINTER_FLOOR: 20,
  ADJACENT_GAP: 8
};
/**
 * getMinTouchTarget.
 * @param {PointerType} pointerType
 * @param {SpacingDensity} density
 * @returns {number}
 */
export function getMinTouchTarget(pointerType = "touch", density) {
  if (pointerType === "pointer") {
    return TOUCH_TARGET_SIZES.POINTER_MIN;
  }
  switch (density) {
    case "comfortable":
      return TOUCH_TARGET_SIZES.COMFORTABLE;
    case "compact":
      return TOUCH_TARGET_SIZES.COMPACT;
    case "spacious":
    default:
      return TOUCH_TARGET_SIZES.WCAG_MIN;
  }
}
/**
 * getTouchTargetSpec.
 * @param {PointerType} pointerType
 * @param {SpacingDensity} density
 * @returns {TouchTargetSpec}
 */
export function getTouchTargetSpec(pointerType = "touch", density) {
  const minSize = getMinTouchTarget(pointerType, density);
  const comfortableSize = pointerType === "pointer" ? TOUCH_TARGET_SIZES.POINTER_MIN : TOUCH_TARGET_SIZES.COMFORTABLE;
  return {
    minSize,
    comfortableSize,
    minGap: TOUCH_TARGET_SIZES.ADJACENT_GAP,
    pointerType
  };
}
/**
 * computeFittsTime.
 * @param {number} distance
 * @param {number} width
 * @param {{ readonly a?: number; readonly b?: number }} constants
 * @returns {number}
 */
export function computeFittsTime(distance, width, constants = {}) {
  const a = constants.a ?? 0;
  const b = constants.b ?? 100;
  const D = Math.max(distance, 1);
  const W = Math.max(width, 1);
  const id = Math.log2(2 * D / W);
  return a + b * id;
}
/**
 * fittsIndexOfDifficulty.
 * @param {number} distance
 * @param {number} width
 * @returns {number}
 */
export function fittsIndexOfDifficulty(distance, width) {
  const D = Math.max(distance, 1);
  const W = Math.max(width, 1);
  return Math.log2(2 * D / W);
}
/**
 * meetsWCAGTouchTarget.
 * @param {number} size
 * @param {PointerType} pointerType
 * @returns {boolean}
 */
export function meetsWCAGTouchTarget(size, pointerType = "touch") {
  if (pointerType === "pointer") {
    return size >= TOUCH_TARGET_SIZES.POINTER_MIN;
  }
  return size >= TOUCH_TARGET_SIZES.WCAG_MIN;
}
/**
 * computeHitAreaExpansion.
 * @param {number} visualSize
 * @param {PointerType} pointerType
 * @returns {number}
 */
export function computeHitAreaExpansion(visualSize, pointerType = "touch") {
  const minTarget = pointerType === "pointer" ? TOUCH_TARGET_SIZES.POINTER_MIN : TOUCH_TARGET_SIZES.WCAG_MIN;
  const deficit = minTarget - visualSize;
  if (deficit <= 0)
    return 0;
  return Math.ceil(deficit / 2);
}
