// @ts-check

/**
 * SigUI core motion module for duration.
 * @module
 */
import { clamp } from "../utils.js";
export const REDUCED_MOTION_FLOOR_MS = 100;
/**
 * getDurationScale.
 * @returns {DurationScale}
 */
export function getDurationScale() {
  return {
    instant: 0,
    faster: 50,
    fast: 100,
    normal: 200,
    moderate: 300,
    slow: 400,
    slower: 500
  };
}
/**
 * getScaledDurationScale.
 * @param {DurationScale} scale
 * @param {number} factor
 * @returns {DurationScale}
 */
export function getScaledDurationScale(scale, factor) {
  const result = {};
  for (const [name, ms] of Object.entries(scale)) {
    result[name] = Math.round(ms * factor);
  }
  return result;
}
/**
 * computeDuration.
 * @param {number} distancePx
 * @param {ComputeDurationOptions} options
 * @returns {number}
 */
export function computeDuration(distancePx, options) {
  const referenceDistance = options?.referenceDistance ?? 100;
  const baseDuration = options?.baseDuration ?? 200;
  const maxDuration = options?.maxDuration ?? 500;
  const distance = Math.abs(distancePx);
  if (distance === 0)
    return 0;
  const raw = baseDuration * Math.sqrt(distance / referenceDistance);
  return clamp(Math.round(raw), 0, maxDuration);
}
