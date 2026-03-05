// @ts-check

/**
 * SigUI core harmony module for harmony.
 * @module
 */
import { normalizeHue } from "../utils.js";
const HARMONY_OFFSETS = {
  monochromatic: [0],
  complementary: [0, 180],
  analogous: [0, -30, 30],
  "split-complementary": [0, 150, 210],
  triadic: [0, 120, 240],
  tetradic: [0, 90, 180, 270]
};
/**
 * computeHarmony.
 * @param {number} hue
 * @param {HarmonyMode} mode
 * @returns {HarmonyResult}
 */
export function computeHarmony(hue, mode) {
  const offsets = HARMONY_OFFSETS[mode];
  const hues = offsets.map((offset) => normalizeHue(hue + offset));
  return { primary: normalizeHue(hue), hues };
}
