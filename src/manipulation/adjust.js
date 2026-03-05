// @ts-check

/**
 * SigUI core manipulation module for adjust.
 * @module
 */
import { toOklch } from "../color-space/oklch.js";
import { clamp, normalizeHue } from "../utils.js";

/** @typedef {{ l: number, c: number, h: number, alpha: number }} OklchColor */
/** @typedef {string | OklchColor} ColorInput */

/**
 * Normalize string/OKLCH input to OKLCH.
 * @param {ColorInput} color
 * @returns {OklchColor}
 */
function resolve(color) {
  return typeof color === "string" ? toOklch(color) : color;
}
/**
 * lighten.
 * @param {ColorInput} color
 * @param {number} amount
 * @returns {OklchColor}
 */
export function lighten(color, amount) {
  const c = resolve(color);
  return { ...c, l: clamp(c.l + amount, 0, 1) };
}
/**
 * darken.
 * @param {ColorInput} color
 * @param {number} amount
 * @returns {OklchColor}
 */
export function darken(color, amount) {
  const c = resolve(color);
  return { ...c, l: clamp(c.l - amount, 0, 1) };
}
/**
 * saturate.
 * @param {ColorInput} color
 * @param {number} amount
 * @returns {OklchColor}
 */
export function saturate(color, amount) {
  const c = resolve(color);
  return { ...c, c: c.c + amount };
}
/**
 * desaturate.
 * @param {ColorInput} color
 * @param {number} amount
 * @returns {OklchColor}
 */
export function desaturate(color, amount) {
  const c = resolve(color);
  return { ...c, c: Math.max(0, c.c - amount) };
}
/**
 * shiftHue.
 * @param {ColorInput} color
 * @param {number} degrees
 * @returns {OklchColor}
 */
export function shiftHue(color, degrees) {
  const c = resolve(color);
  return { ...c, h: normalizeHue(c.h + degrees) };
}
