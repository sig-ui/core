// @ts-check

/**
 * SigUI core motion module for flip.
 * @module
 */
export const FLIP_THRESHOLD_PX = 1;
const FLIP_SCALE_THRESHOLD = 0.01;
/**
 * computeFlipInversion.
 * @param {FlipRect} first
 * @param {FlipRect} last
 * @returns {FlipInversion}
 */
export function computeFlipInversion(first, last) {
  const dx = first.x - last.x;
  const dy = first.y - last.y;
  const scaleX = last.width > 0 ? first.width / last.width : 1;
  const scaleY = last.height > 0 ? first.height / last.height : 1;
  const isIdentity = Math.abs(dx) < FLIP_THRESHOLD_PX && Math.abs(dy) < FLIP_THRESHOLD_PX && Math.abs(scaleX - 1) < FLIP_SCALE_THRESHOLD && Math.abs(scaleY - 1) < FLIP_SCALE_THRESHOLD;
  return { x: dx, y: dy, scaleX, scaleY, isIdentity };
}
