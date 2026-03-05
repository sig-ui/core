// @ts-check

/**
 * SigUI core contrast module for bridge pca.
 * @module
 */
import { apcaContrast } from "./apca.js";
const BRIDGE_TABLE = [
  [0, 1],
  [15, 1.5],
  [30, 2],
  [45, 3],
  [60, 4.5],
  [75, 7],
  [90, 10],
  [105, 15],
  [120, 21]
];
/**
 * bridgeLcToRatio.
 * @param {number} absLc
 * @returns {number}
 */
export function bridgeLcToRatio(absLc) {
  const lc = Math.abs(absLc);
  if (lc <= 0)
    return 1;
  for (let i = 1;i < BRIDGE_TABLE.length; i++) {
    const [lcLow, ratioLow] = BRIDGE_TABLE[i - 1];
    const [lcHigh, ratioHigh] = BRIDGE_TABLE[i];
    if (lc <= lcHigh) {
      const t = (lc - lcLow) / (lcHigh - lcLow);
      return ratioLow + t * (ratioHigh - ratioLow);
    }
  }
  return BRIDGE_TABLE[BRIDGE_TABLE.length - 1][1];
}
/**
 * bridgePcaContrast.
 * @param {OklchColor | string} fg
 * @param {OklchColor | string} bg
 * @returns {number}
 */
export function bridgePcaContrast(fg, bg) {
  const lc = apcaContrast(fg, bg);
  return bridgeLcToRatio(lc);
}
/**
 * meetsBridgeAA.
 * @param {OklchColor | string} fg
 * @param {OklchColor | string} bg
 * @param {boolean} largeText
 * @returns {boolean}
 */
export function meetsBridgeAA(fg, bg, largeText = false) {
  const ratio = bridgePcaContrast(fg, bg);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}
/**
 * meetsBridgeAAA.
 * @param {OklchColor | string} fg
 * @param {OklchColor | string} bg
 * @param {boolean} largeText
 * @returns {boolean}
 */
export function meetsBridgeAAA(fg, bg, largeText = false) {
  const ratio = bridgePcaContrast(fg, bg);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}
