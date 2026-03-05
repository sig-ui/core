// @ts-check

/**
 * SigUI core color space module for srgb.
 * @module
 */
/**
 * parseHex.
 * @param {string} hex
 * @returns {SrgbColor}
 */
export function parseHex(hex) {
  let h = hex.startsWith("#") ? hex.slice(1) : hex;
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  } else if (h.length === 4) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, alpha: a };
}
/**
 * toHex.
 * @param {SrgbColor} color
 * @returns {string}
 */
export function toHex(color) {
  const r = Math.round(Math.max(0, Math.min(255, color.r)));
  const g = Math.round(Math.max(0, Math.min(255, color.g)));
  const b = Math.round(Math.max(0, Math.min(255, color.b)));
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  if (color.alpha < 1) {
    const a = Math.round(color.alpha * 255);
    return hex + a.toString(16).padStart(2, "0");
  }
  return hex;
}
/**
 * srgbToLinear.
 * @param {number} value
 * @returns {number}
 */
export function srgbToLinear(value) {
  const v = value < 0 ? -value : value;
  const sign = value < 0 ? -1 : 1;
  if (v <= 0.04045)
    return sign * (v / 12.92);
  return sign * Math.pow((v + 0.055) / 1.055, 2.4);
}
/**
 * linearToSrgb.
 * @param {number} value
 * @returns {number}
 */
export function linearToSrgb(value) {
  const v = value < 0 ? -value : value;
  const sign = value < 0 ? -1 : 1;
  if (v <= 0.0031308)
    return sign * (v * 12.92);
  return sign * (1.055 * Math.pow(v, 1 / 2.4) - 0.055);
}
/**
 * srgbToLinearRgb.
 * @param {SrgbColor} color
 * @returns {LinearRgb}
 */
export function srgbToLinearRgb(color) {
  return {
    r: srgbToLinear(color.r / 255),
    g: srgbToLinear(color.g / 255),
    b: srgbToLinear(color.b / 255)
  };
}
/**
 * linearRgbToSrgb.
 * @param {LinearRgb} rgb
 * @param {number} alpha
 * @returns {SrgbColor}
 */
export function linearRgbToSrgb(rgb, alpha = 1) {
  return {
    r: Math.round(Math.max(0, Math.min(255, linearToSrgb(rgb.r) * 255))),
    g: Math.round(Math.max(0, Math.min(255, linearToSrgb(rgb.g) * 255))),
    b: Math.round(Math.max(0, Math.min(255, linearToSrgb(rgb.b) * 255))),
    alpha
  };
}
