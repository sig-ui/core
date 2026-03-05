// @ts-check

/**
 * SigUI core generation module for hunt.
 * @module
 */
import { lerp, smoothstep } from "../utils.js";
/**
 * huntFactor.
 * @param {number} bgLightness
 * @returns {number}
 */
export function huntFactor(bgLightness) {
  return lerp(0.15, 0.05, smoothstep(0.05, 0.25, bgLightness));
}
/**
 * applyHuntCompensation.
 * @param {number} chroma
 * @param {number} bgLightness
 * @returns {number}
 */
export function applyHuntCompensation(chroma, bgLightness) {
  return chroma * (1 + huntFactor(bgLightness));
}
