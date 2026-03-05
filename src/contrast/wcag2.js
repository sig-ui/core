// @ts-check

/**
 * SigUI core contrast module for wcag2.
 * @module
 */
import { oklchToOklab, oklabToLinearRgb, toOklch } from "../color-space/oklch.js";
function resolveToLinear(color) {
  const oklch = typeof color === "string" ? toOklch(color) : color;
  const lab = oklchToOklab(oklch);
  const linear = oklabToLinearRgb(lab);
  return [
    Math.max(0, linear.r),
    Math.max(0, linear.g),
    Math.max(0, linear.b)
  ];
}
/**
 * wcag2Luminance.
 * @param {OklchColor | string} color
 * @returns {number}
 */
export function wcag2Luminance(color) {
  const [r, g, b] = resolveToLinear(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/**
 * wcag2Contrast.
 * @param {OklchColor | string} fg
 * @param {OklchColor | string} bg
 * @returns {number}
 */
export function wcag2Contrast(fg, bg) {
  const l1 = wcag2Luminance(fg);
  const l2 = wcag2Luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
/**
 * meetsWCAG_AA.
 * @param {OklchColor | string} fg
 * @param {OklchColor | string} bg
 * @param {boolean} largeText
 * @returns {boolean}
 */
export function meetsWCAG_AA(fg, bg, largeText = false) {
  const ratio = wcag2Contrast(fg, bg);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}
/**
 * meetsWCAG_AAA.
 * @param {OklchColor | string} fg
 * @param {OklchColor | string} bg
 * @param {boolean} largeText
 * @returns {boolean}
 */
export function meetsWCAG_AAA(fg, bg, largeText = false) {
  const ratio = wcag2Contrast(fg, bg);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}
