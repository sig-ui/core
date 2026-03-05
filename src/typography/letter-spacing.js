// @ts-check

/**
 * SigUI core typography module for letter spacing.
 * @module
 */
import { clamp } from "../utils.js";
const TRACKING_ANCHORS = [
  [11, 0.02],
  [13, 0.01],
  [16, 0],
  [19, 0],
  [23, 0],
  [28, -0.01],
  [33, -0.01],
  [40, -0.01],
  [48, -0.02],
  [57, -0.02]
];
/**
 * computeLetterSpacing.
 * @param {number} fontSizeRem
 * @returns {string}
 */
export function computeLetterSpacing(fontSizeRem) {
  const fontSizePx = fontSizeRem * 16;
  const minPx = TRACKING_ANCHORS[0][0];
  const maxPx = TRACKING_ANCHORS[TRACKING_ANCHORS.length - 1][0];
  const clampedPx = clamp(fontSizePx, minPx, maxPx);
  let lowerIndex = 0;
  for (let i = 0;i < TRACKING_ANCHORS.length - 1; i++) {
    if (clampedPx >= TRACKING_ANCHORS[i][0] && clampedPx <= TRACKING_ANCHORS[i + 1][0]) {
      lowerIndex = i;
      break;
    }
  }
  const [px0, em0] = TRACKING_ANCHORS[lowerIndex];
  const [px1, em1] = TRACKING_ANCHORS[lowerIndex + 1];
  const t = px1 === px0 ? 0 : (clampedPx - px0) / (px1 - px0);
  const emValue = em0 + (em1 - em0) * t;
  return formatEm(emValue);
}
function formatEm(value) {
  const rounded = Math.round(value * 1000) / 1000;
  if (rounded === 0)
    return "0em";
  return `${rounded}em`;
}
/**
 * capsLetterSpacing.
 * @returns {string}
 */
export function capsLetterSpacing() {
  return "0.05em";
}
