// @ts-check

/**
 * SigUI core interactive module for loading.
 * @module
 */
/**
 * getLoadingThresholds.
 * @returns {LoadingThresholds}
 */
export function getLoadingThresholds() {
  return {
    imperceptible: 100,
    spinner: 1000,
    skeleton: 1e4
  };
}
/**
 * selectLoadingStrategy.
 * @param {number} expectedMs
 * @returns {LoadingStrategy}
 */
export function selectLoadingStrategy(expectedMs) {
  const thresholds = getLoadingThresholds();
  if (expectedMs < thresholds.imperceptible)
    return "none";
  if (expectedMs < thresholds.spinner)
    return "spinner";
  if (expectedMs < thresholds.skeleton)
    return "skeleton";
  return "progress";
}
/**
 * getSkeletonConfig.
 * @returns {SkeletonConfig}
 */
export function getSkeletonConfig() {
  return {
    shimmerDuration: 1500,
    shimmerEasing: "ease-in-out",
    appearDelay: 300,
    transitionDuration: 200
  };
}
/**
 * getButtonSpinnerConfig.
 * @returns {{ size: string, borderWidth: string, animationDuration: number }}
 */
export function getButtonSpinnerConfig() {
  return {
    size: "1em",
    borderWidth: "2px",
    animationDuration: 600
  };
}
