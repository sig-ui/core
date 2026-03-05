// @ts-check

/**
 * SigUI core generation module for hue blend.
 * @module
 */
import { lerpHue } from "../utils.js";
/**
 * blendHue.
 * @param {number} shadeHue
 * @param {number} backgroundHue
 * @param {ShadeStop} shade
 * @param {number} blendStrength
 * @returns {number}
 */
export function blendHue(shadeHue, backgroundHue, shade, blendStrength = 0.05) {
  const distance = Math.abs(shade - 500) / 500;
  const blendFactor = distance * blendStrength;
  return lerpHue(shadeHue, backgroundHue, blendFactor);
}
