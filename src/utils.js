// @ts-check

/**
 * SigUI core utils module for utils.
 * @module
 */
/**
 * clamp.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
/**
 * lerp.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
/**
 * smoothstep.
 * @param {number} edge0
 * @param {number} edge1
 * @param {number} x
 * @returns {number}
 */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
/**
 * toRadians.
 * @param {number} degrees
 * @returns {number}
 */
export function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
/**
 * toDegrees.
 * @param {number} radians
 * @returns {number}
 */
export function toDegrees(radians) {
  return radians * 180 / Math.PI;
}
/**
 * normalizeHue.
 * @param {number} h
 * @returns {number}
 */
export function normalizeHue(h) {
  return (h % 360 + 360) % 360;
}
/**
 * lerpHue.
 * @param {number} h1
 * @param {number} h2
 * @param {number} t
 * @returns {number}
 */
export function lerpHue(h1, h2, t) {
  let diff = h2 - h1;
  if (diff > 180)
    diff -= 360;
  if (diff < -180)
    diff += 360;
  return normalizeHue(h1 + diff * t);
}
/**
 * multiplyMatrix3.
 * @param {readonly (readonly number[])[]} m
 * @param {readonly [number, number, number]} v
 * @returns {[number, number, number]}
 */
export function multiplyMatrix3(m, v) {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
  ];
}
