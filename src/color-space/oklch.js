// @ts-check

/**
 * SigUI core color space module for oklch.
 * @module
 */
import {
  SRGB_TO_LMS,
  LMS_TO_SRGB,
  LMS3_TO_OKLAB,
  OKLAB_TO_LMS3
} from "./matrices.js";
import { multiplyMatrix3, toDegrees, toRadians, normalizeHue } from "../utils.js";
import { parseHex, toHex, srgbToLinearRgb, linearRgbToSrgb, linearToSrgb } from "./srgb.js";
/**
 * linearRgbToOklab.
 * @param {LinearRgb} rgb
 * @returns {OklabColor}
 */
export function linearRgbToOklab(rgb) {
  const [l, m, s] = multiplyMatrix3(SRGB_TO_LMS, [rgb.r, rgb.g, rgb.b]);
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const [L, a, b] = multiplyMatrix3(LMS3_TO_OKLAB, [l_, m_, s_]);
  return { L, a, b, alpha: 1 };
}
/**
 * oklabToLinearRgb.
 * @param {OklabColor} lab
 * @returns {LinearRgb}
 */
export function oklabToLinearRgb(lab) {
  const [l_, m_, s_] = multiplyMatrix3(OKLAB_TO_LMS3, [lab.L, lab.a, lab.b]);
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const [r, g, b] = multiplyMatrix3(LMS_TO_SRGB, [l, m, s]);
  return { r, g, b };
}
/**
 * oklabToOklch.
 * @param {OklabColor} lab
 * @returns {OklchColor}
 */
export function oklabToOklch(lab) {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = toDegrees(Math.atan2(lab.b, lab.a));
  if (h < 0)
    h += 360;
  return { l: lab.L, c, h: c < 0.0001 ? 0 : h, alpha: lab.alpha };
}
/**
 * oklchToOklab.
 * @param {OklchColor} lch
 * @returns {OklabColor}
 */
export function oklchToOklab(lch) {
  const hRad = toRadians(lch.h);
  return {
    L: lch.l,
    a: lch.c * Math.cos(hRad),
    b: lch.c * Math.sin(hRad),
    alpha: lch.alpha
  };
}
/**
 * toOklch.
 * @param {string} input
 * @returns {OklchColor}
 */
export function toOklch(input) {
  const trimmed = input.trim();
  if (trimmed.startsWith("oklch(")) {
    return parseOklchString(trimmed);
  }
  if (trimmed.startsWith("rgb")) {
    return parseRgbString(trimmed);
  }
  if (trimmed.startsWith("hsl")) {
    return parseHslString(trimmed);
  }
  const srgb = parseHex(trimmed);
  const linear = srgbToLinearRgb(srgb);
  const lab = linearRgbToOklab(linear);
  const oklch = oklabToOklch(lab);
  return { ...oklch, alpha: srgb.alpha };
}
/**
 * fromOklch.
 * @param {OklchColor} color
 * @param {ColorFormat} format
 * @returns {string}
 */
export function fromOklch(color, format = "oklch") {
  switch (format) {
    case "oklch": {
      const alphaStr = color.alpha < 1 ? ` / ${color.alpha}` : "";
      return `oklch(${round(color.l, 4)} ${round(color.c, 4)} ${round(color.h, 2)}${alphaStr})`;
    }
    case "hex": {
      const lab = oklchToOklab(color);
      const linear = oklabToLinearRgb(lab);
      const srgb = linearRgbToSrgb(linear, color.alpha);
      return toHex(srgb);
    }
    case "rgb": {
      const lab = oklchToOklab(color);
      const linear = oklabToLinearRgb(lab);
      const srgb = linearRgbToSrgb(linear, color.alpha);
      if (color.alpha < 1) {
        return `rgba(${srgb.r}, ${srgb.g}, ${srgb.b}, ${color.alpha})`;
      }
      return `rgb(${srgb.r}, ${srgb.g}, ${srgb.b})`;
    }
    case "hsl": {
      const lab = oklchToOklab(color);
      const linear = oklabToLinearRgb(lab);
      const r = linearToSrgb(linear.r);
      const g = linearToSrgb(linear.g);
      const b = linearToSrgb(linear.b);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      if (max === min) {
        if (color.alpha < 1)
          return `hsla(0, 0%, ${round(l * 100, 1)}%, ${color.alpha})`;
        return `hsl(0, 0%, ${round(l * 100, 1)}%)`;
      }
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let h = 0;
      if (max === r)
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g)
        h = ((b - r) / d + 2) / 6;
      else
        h = ((r - g) / d + 4) / 6;
      if (color.alpha < 1)
        return `hsla(${round(h * 360, 1)}, ${round(s * 100, 1)}%, ${round(l * 100, 1)}%, ${color.alpha})`;
      return `hsl(${round(h * 360, 1)}, ${round(s * 100, 1)}%, ${round(l * 100, 1)}%)`;
    }
  }
}
function round(n, decimals) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
function parseOklchString(str) {
  const inner = str.slice(6, -1).trim();
  const [lch, alphaPart] = inner.split("/");
  const parts = lch.trim().split(/\s+/);
  return {
    l: parseFloat(parts[0]),
    c: parseFloat(parts[1]),
    h: parseFloat(parts[2]),
    alpha: alphaPart ? parseFloat(alphaPart.trim()) : 1
  };
}
function parseRgbString(str) {
  const inner = str.replace(/rgba?\(/, "").replace(")", "").trim();
  const [rgb, alphaPart] = inner.split("/");
  const parts = (rgb ?? inner).split(/[\s,]+/).filter(Boolean);
  const r = parseFloat(parts[0]);
  const g = parseFloat(parts[1]);
  const b = parseFloat(parts[2]);
  let alpha = 1;
  if (alphaPart) {
    alpha = parseFloat(alphaPart.trim());
  } else if (parts[3]) {
    alpha = parseFloat(parts[3]);
  }
  const srgb = { r, g, b, alpha };
  const linear = srgbToLinearRgb(srgb);
  const lab = linearRgbToOklab(linear);
  const oklch = oklabToOklch(lab);
  return { ...oklch, alpha };
}
function parseHslString(str) {
  const inner = str.replace(/hsla?\(/, "").replace(")", "").trim();
  const [hsl, alphaPart] = inner.split("/");
  const parts = (hsl ?? inner).split(/[\s,]+/).filter(Boolean);
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  let alpha = 1;
  if (alphaPart) {
    alpha = parseFloat(alphaPart.trim());
  } else if (parts[3]) {
    alpha = parseFloat(parts[3]);
  }
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  const srgb = { r: r * 255, g: g * 255, b: b * 255, alpha };
  const linear = srgbToLinearRgb(srgb);
  const lab = linearRgbToOklab(linear);
  const oklch = oklabToOklch(lab);
  return { ...oklch, alpha };
}
function hueToRgb(p, q, t) {
  let tt = t;
  if (tt < 0)
    tt += 1;
  if (tt > 1)
    tt -= 1;
  if (tt < 1 / 6)
    return p + (q - p) * 6 * tt;
  if (tt < 1 / 2)
    return q;
  if (tt < 2 / 3)
    return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}
