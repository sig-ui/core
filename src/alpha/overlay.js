// @ts-check

/**
 * SigUI core alpha module for overlay.
 * @module
 */
import { srgbToLinear } from "../color-space/srgb.js";
const OVERLAY_STEPS = 12;
function grayToOklchL(gray01) {
  const linear = srgbToLinear(gray01);
  return Math.cbrt(linear);
}
/**
 * generateBlackAlphaScale.
 * @returns {OverlayScale}
 */
export function generateBlackAlphaScale() {
  const steps = [];
  const lMax = 0.97;
  const lMin = 0.25;
  for (let i = 0;i < OVERLAY_STEPS; i++) {
    const targetL = lMax - i / (OVERLAY_STEPS - 1) * (lMax - lMin);
    let lo = 0;
    let hi = 1;
    for (let iter = 0;iter < 64; iter++) {
      const mid = (lo + hi) / 2;
      const gray01 = 1 - mid;
      const l = grayToOklchL(gray01);
      if (l > targetL) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const opacity = Math.round((lo + hi) / 2 * 1000) / 1000;
    steps.push({
      step: i + 1,
      opacity,
      css: `rgba(0, 0, 0, ${opacity})`
    });
  }
  return steps;
}
/**
 * generateWhiteAlphaScale.
 * @returns {OverlayScale}
 */
export function generateWhiteAlphaScale() {
  const steps = [];
  const lMin = 0.25;
  const lMax = 0.97;
  for (let i = 0;i < OVERLAY_STEPS; i++) {
    const targetL = lMin + i / (OVERLAY_STEPS - 1) * (lMax - lMin);
    let lo = 0;
    let hi = 1;
    for (let iter = 0;iter < 64; iter++) {
      const mid = (lo + hi) / 2;
      const gray01 = mid;
      const l = grayToOklchL(gray01);
      if (l < targetL) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const opacity = Math.round((lo + hi) / 2 * 1000) / 1000;
    steps.push({
      step: i + 1,
      opacity,
      css: `rgba(255, 255, 255, ${opacity})`
    });
  }
  return steps;
}
