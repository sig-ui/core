// @ts-check

/**
 * SigUI core device module for refresh.
 * @module
 */
export const REFRESH_TIER_MIN_DURATION = {
  high: 44,
  medium: 67,
  low: 133
};
/**
 * classifyRefreshRate.
 * @param {number} hz
 * @returns {RefreshTier}
 */
export function classifyRefreshRate(hz) {
  if (hz >= 90)
    return "high";
  if (hz >= 45)
    return "medium";
  return "low";
}
/**
 * getMinAnimationDuration.
 * @param {RefreshTier} tier
 * @returns {number}
 */
export function getMinAnimationDuration(tier) {
  return REFRESH_TIER_MIN_DURATION[tier];
}
