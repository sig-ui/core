// @ts-check

/**
 * SigUI core generation module for hk.
 * @module
 */
import { clamp, toRadians, smoothstep } from "../utils.js";
/**
 * hkOffset.
 * @param {number} c
 * @param {number} h
 * @returns {number}
 */
export function hkOffset(c, h) {
  if (c < 0.04)
    return 0;
  let hueWeight = 0.14 + 0.15 * (Math.cos(toRadians(h - 25)) + Math.cos(toRadians(2 * h - 530)));
  const hgnDelta = toRadians(h - 350);
  const hgnSigma = toRadians(30);
  hueWeight += 0.04 * Math.exp(-(hgnDelta * hgnDelta) / (2 * hgnSigma * hgnSigma));
  hueWeight = clamp(hueWeight, 0, 0.4);
  const chromaScale = smoothstep(0.04, 0.2, c);
  return hueWeight * chromaScale * 0.05;
}
